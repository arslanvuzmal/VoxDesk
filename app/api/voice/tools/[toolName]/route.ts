import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import {
  signConversationContext,
  verifyConversationContext,
} from '@/lib/security/conversation-context';
import {
  executeDatabaseTool,
  isSupportedDatabaseTool,
  ToolExecutionError,
} from '@/lib/voice-agent/tool-executor';

const ToolExecutionSchema = z.object({
  toolExecutionId: z.string().min(8).max(200),
  parameters: z.record(z.unknown()).default({}),
});

const MUTATING_TOOLS = new Set([
  'create_or_update_contact',
  'hold_appointment_slot',
  'book_appointment',
  'reschedule_appointment',
  'cancel_appointment',
  'create_opportunity',
  'update_opportunity',
  'create_task',
  'complete_task',
  'schedule_callback',
  'create_follow_up',
  'record_opt_out',
  'request_human_handoff',
]);

function getContextToken(req: NextRequest): string | null {
  const explicit = req.headers.get('x-voxdesk-conversation-context');
  const authorization = req.headers.get('authorization');
  return explicit || (authorization?.startsWith('Bearer ') ? authorization.slice(7) : null);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ toolName: string }> }
) {
  const { toolName } = await params;
  const correlationId = crypto.randomUUID();
  const token = getContextToken(req);

  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTHENTICATION', message: 'Signed conversation context is required.' } },
      { status: 401 }
    );
  }

  let context;
  try {
    context = verifyConversationContext(token);
  } catch {
    return NextResponse.json(
      { error: { code: 'AUTHORIZATION', message: 'Conversation context is invalid or expired.' } },
      { status: 403 }
    );
  }

  const parsed = ToolExecutionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid tool request.', correlationId } },
      { status: 400 }
    );
  }

  if (isSupportedDatabaseTool(toolName)) {
    try {
      const data = await executeDatabaseTool(
        toolName,
        parsed.data.toolExecutionId,
        parsed.data.parameters,
        context
      );
      const refreshedContext =
        toolName === 'create_or_update_contact' && typeof data.contactId === 'string'
          ? signConversationContext({ ...context, contactId: data.contactId })
          : undefined;
      return NextResponse.json({
        data: refreshedContext ? { ...data, conversationContextToken: refreshedContext } : data,
        meta: { correlationId },
      });
    } catch (error) {
      if (error instanceof ToolExecutionError) {
        return NextResponse.json(
          { error: { code: error.code, message: error.message, correlationId } },
          { status: error.status }
        );
      }
      return NextResponse.json(
        {
          error: {
            code: 'UNKNOWN',
            message: 'The business action could not be completed.',
            correlationId,
          },
        },
        { status: 500 }
      );
    }
  }

  if (MUTATING_TOOLS.has(toolName)) {
    return NextResponse.json(
      {
        error: {
          code: 'TOOL_NOT_CONFIGURED',
          message: 'This business action is not configured. No record was created or changed.',
          correlationId,
        },
      },
      { status: 501 }
    );
  }

  if (toolName === 'get_business_information') {
    const business = await prisma.businessProfile.findFirst({
      where: { id: context.businessId, workspaceId: context.workspaceId },
      select: {
        id: true,
        businessName: true,
        description: true,
        timezone: true,
        openingHours: true,
        holidayRules: true,
        defaultLanguage: true,
      },
    });
    if (!business) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Business information was not found.' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: business, meta: { correlationId } });
  }

  if (toolName === 'search_business_knowledge') {
    const query = z.string().min(2).max(500).safeParse(parsed.data.parameters.query);
    if (!query.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'A knowledge query is required.' } },
        { status: 400 }
      );
    }
    const terms = query.data.trim().split(/\s+/).slice(0, 8);
    const now = new Date();
    const knowledge = await prisma.knowledgeItem.findMany({
      where: {
        workspaceId: context.workspaceId,
        language: context.language,
        status: 'ACTIVE',
        verifiedAt: { not: null },
        AND: [
          { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
        OR: terms.flatMap(term => [
          { title: { contains: term, mode: 'insensitive' as const } },
          { question: { contains: term, mode: 'insensitive' as const } },
          { content: { contains: term, mode: 'insensitive' as const } },
          { answer: { contains: term, mode: 'insensitive' as const } },
        ]),
      },
      select: {
        id: true,
        title: true,
        category: true,
        question: true,
        answer: true,
        content: true,
        language: true,
        version: true,
        source: true,
      },
      take: 5,
    });
    return NextResponse.json({
      data: { found: knowledge.length > 0, items: knowledge },
      meta: { correlationId },
    });
  }

  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message: 'Tool is not available.', correlationId } },
    { status: 404 }
  );
}
