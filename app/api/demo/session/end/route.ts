import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { demoSessionStore } from '@/lib/demo/store';
import { getOrganizationProfile } from '@/lib/organization/registry';
import { persistFinalCallResult } from '@/lib/database/persistence';
import { calculateLeadQualification } from '@/lib/conversation/qualification';
import { FinalCallResult } from '@/lib/conversation/types/final-call-result';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
    const session = cookieToken ? await getDemoSessionFromCookieToken(cookieToken) : null;

    if (!session) {
      return NextResponse.json(
        {
          error: 'Session expired or invalid.',
          code: 'SESSION_EXPIRED',
        },
        { status: 404 }
      );
    }

    const presetKey = session.presetKey || 'LEGAL';
    const language = (session.language as any) || 'en-US';
    const profile = getOrganizationProfile(presetKey);
    const accumulated = session.accumulatedFields || {};

    const turnsCompleted = session.turnsUsed || 1;
    const durationSeconds = Math.max(10, Math.round((Date.now() - session.createdAt) / 1000));

    // Lead qualification calculation if qualification-related
    let qualification: any = undefined;
    if (
      session.scenario === 'QUALIFICATION' ||
      accumulated.serviceInterest ||
      accumulated.budgetRange
    ) {
      qualification = calculateLeadQualification(
        {
          serviceInterest:
            accumulated.serviceInterest || accumulated.legalCategory || profile.services[0]?.name,
          budgetRange: accumulated.budgetRange || accumulated.priceBudget,
          timeline: accumulated.timeline || accumulated.buyingTimeline,
          authority: accumulated.authority,
          urgency: accumulated.urgencyLevel,
          extractedFields: accumulated,
        },
        profile
      );
    }

    const fullResult: FinalCallResult = {
      sessionId: session.sessionId,
      organization: {
        id: profile.id,
        name: profile.name,
        industry: profile.industry,
      },
      language: language as any,
      scenario: session.scenario as any,
      startedAt: new Date(session.createdAt).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds,
      turnsCompleted,
      transcript: session.history || [],
      accumulatedFields: accumulated,
      summary:
        session.history && session.history.length > 0
          ? session.history[session.history.length - 1].text
          : (profile.greetings as Record<string, string>)[language] || profile.greetings['en-US'],
      qualification,
      businessActions: session.latestBusinessAction ? [session.latestBusinessAction] : [],
      persistedRecords: {},
      providersUsed:
        session.providerExecutions && session.providerExecutions.length > 0
          ? session.providerExecutions
          : [
              {
                layer: 'STT',
                provider: 'BROWSER',
                language: language as any,
                success: true,
                fallbackUsed: true,
              },
              {
                layer: 'LLM',
                provider: 'CLOUDFLARE',
                language: language as any,
                success: true,
                fallbackUsed: false,
              },
              {
                layer: 'TTS',
                provider: 'DETERMINISTIC',
                language: language as any,
                success: true,
                fallbackUsed: false,
              },
            ],
      persistence: {
        success: false,
        persisted: false,
      },
      degradedMode: false,
      warnings: [],
    };

    // Execute atomic Prisma database persistence
    const dbRes = await persistFinalCallResult(fullResult);
    fullResult.persistedRecords = dbRes.recordIds;
    fullResult.persistence = {
      success: dbRes.success,
      persisted: dbRes.persisted,
      errorCode: !dbRes.persisted ? 'DATABASE_UNAVAILABLE' : undefined,
      message: dbRes.error || 'Persistence completed',
    };

    await demoSessionStore.endSession(session.sessionId, 'CALL_COMPLETED');

    const response = NextResponse.json({
      success: true,
      finalCallResult: fullResult,
      persisted: dbRes.persisted,
      recordIds: dbRes.recordIds,
    });

    response.cookies.delete('voxdesk_demo_session');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to finalize session.',
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Session termination failed',
      },
      { status: 500 }
    );
  }
}
