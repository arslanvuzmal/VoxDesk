import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { campaignId: id };
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
    const body = await req.json();
    const { recipients } = body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients array required' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.state !== 'DRAFT' && campaign.state !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Cannot add recipients to active campaign' },
        { status: 400 }
      );
    }

    const data = recipients.map((r: any) => ({
      campaignId: id,
      contactId: r.contactId,
      recipientName: r.recipientName,
      recipientPhoneEncrypted: r.recipientPhone,
      recipientPhoneHash: r.recipientPhone
        ? require('crypto').createHash('sha256').update(r.recipientPhone).digest('hex')
        : null,
      recipientEmailEncrypted: r.recipientEmail,
      countryCode: r.countryCode || 'US',
      status: 'PENDING',
    }));

    await prisma.campaignRecipient.createMany({
      data,
      skipDuplicates: true,
    });

    const count = await prisma.campaignRecipient.count({ where: { campaignId: id } });

    return NextResponse.json({ added: recipients.length, total: count });
  } catch (error) {
    console.error('[CAMPAIGN RECIPIENTS POST ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
