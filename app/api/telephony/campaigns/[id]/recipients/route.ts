import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';

const RecipientBatchSchema = z.object({
  recipients: z
    .array(
      z.object({
        contactId: z.string().min(1),
        countryCode: z.string().regex(/^[A-Z]{2}$/),
      })
    )
    .min(1)
    .max(1_000),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:view');
    if ('errorResponse' in access) return access.errorResponse;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;

    const where: Prisma.CampaignRecipientWhereInput = {
      campaignId: id,
      workspaceId: access.workspaceId,
    };
    if (status) where.status = status;

    const [recipients, total] = await Promise.all([
      prisma.campaignRecipient.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { outboundAttempts: true },
      }),
      prisma.campaignRecipient.count({ where }),
    ]);

    return NextResponse.json({ recipients, total });
  } catch (error) {
    console.error('[CAMPAIGN RECIPIENTS GET ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:manage');
    if ('errorResponse' in access) return access.errorResponse;
    const parsed = RecipientBatchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'A valid contact recipient list is required.' } },
        { status: 400 }
      );
    }
    const recipientByContact = new Map(
      parsed.data.recipients.map(recipient => [recipient.contactId, recipient])
    );
    const contactIds = [...recipientByContact.keys()];

    const campaign = await prisma.campaign.findFirst({
      where: { id, workspaceId: access.workspaceId },
      select: { id: true, state: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.state !== 'DRAFT' && campaign.state !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Cannot add recipients to active campaign' },
        { status: 400 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds }, workspaceId: access.workspaceId },
      select: {
        id: true,
        name: true,
        phoneEncrypted: true,
        phoneHash: true,
        emailEncrypted: true,
      },
    });
    if (contacts.length !== contactIds.length) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'One or more contacts were not found.' } },
        { status: 404 }
      );
    }

    const existing = await prisma.campaignRecipient.findMany({
      where: { campaignId: id, workspaceId: access.workspaceId, contactId: { in: contactIds } },
      select: { contactId: true },
    });
    const existingIds = new Set(existing.map(recipient => recipient.contactId));
    const data = contacts
      .filter(contact => !existingIds.has(contact.id))
      .map(contact => ({
        workspaceId: access.workspaceId,
        campaignId: id,
        contactId: contact.id,
        recipientName: contact.name,
        recipientPhoneEncrypted: contact.phoneEncrypted,
        recipientPhoneHash: contact.phoneHash,
        recipientEmailEncrypted: contact.emailEncrypted,
        countryCode: recipientByContact.get(contact.id)!.countryCode,
        status: 'PENDING',
      }));

    if (data.length > 0) {
      await prisma.$transaction([
        prisma.campaignRecipient.createMany({ data }),
        prisma.campaign.update({
          where: { id },
          data: { dryRunCompleted: false, dryRunReport: Prisma.JsonNull },
        }),
      ]);
    }

    const count = await prisma.campaignRecipient.count({
      where: { campaignId: id, workspaceId: access.workspaceId },
    });

    return NextResponse.json({ data: { added: data.length, total: count } });
  } catch (error) {
    console.error('[CAMPAIGN RECIPIENTS POST ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
