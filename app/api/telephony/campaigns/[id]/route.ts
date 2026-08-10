import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';

const CampaignDraftPatchSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    targetSegment: z.string().max(200).nullable().optional(),
    callingWindowStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable()
      .optional(),
    callingWindowEnd: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable()
      .optional(),
    timezoneStrategy: z.enum(['LOCAL', 'BUSINESS']).optional(),
    maxAttempts: z.number().int().min(1).max(5).optional(),
    retryIntervalMinutes: z.number().int().min(15).max(10080).optional(),
    concurrencyLimit: z.number().int().min(1).max(20).optional(),
    callsPerMinute: z.number().int().min(1).max(60).optional(),
    openingDisclosure: z.string().max(500).nullable().optional(),
    supportedCountries: z
      .array(z.string().regex(/^[A-Z]{2}$/))
      .min(1)
      .max(25)
      .optional(),
  })
  .strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireCampaignAccess(req, id, 'campaigns:view');
  if ('errorResponse' in access) return access.errorResponse;

  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: access.workspaceId },
    include: {
      recipients: { include: { outboundAttempts: true }, orderBy: { createdAt: 'desc' } },
      attempts: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!campaign) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Campaign was not found.' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: campaign });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireCampaignAccess(req, id, 'campaigns:manage');
  if ('errorResponse' in access) return access.errorResponse;

  const parsed = CampaignDraftPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid campaign draft update.' } },
      { status: 400 }
    );
  }
  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: access.workspaceId },
    select: { state: true },
  });
  if (!existing || existing.state !== 'DRAFT') {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Only draft campaigns can be edited.' } },
      { status: 409 }
    );
  }
  const campaign = await prisma.campaign.update({
    where: { id },
    data: { ...parsed.data, dryRunCompleted: false, dryRunReport: Prisma.JsonNull },
  });
  return NextResponse.json({ data: campaign });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireCampaignAccess(req, id, 'campaigns:manage');
  if ('errorResponse' in access) return access.errorResponse;

  const existing = await prisma.campaign.findFirst({
    where: { id, workspaceId: access.workspaceId },
    select: { state: true },
  });
  if (!existing || existing.state !== 'DRAFT') {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Only draft campaigns can be deleted.' } },
      { status: 409 }
    );
  }
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
