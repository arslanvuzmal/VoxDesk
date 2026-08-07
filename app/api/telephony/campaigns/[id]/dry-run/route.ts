import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { recipients: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.dryRunCompleted) {
      return NextResponse.json(
        { error: 'Dry run already completed', dryRunReport: campaign.dryRunReport },
        { status: 400 }
      );
    }

    const totalRecipients = campaign.recipients.length;
    const invalidNumbers = campaign.recipients.filter(r => !r.recipientPhoneEncrypted).length;
    const missingConsent = 0;
    const suppressedContacts = campaign.recipients.filter(r => r.suppressedAt).length;
    const outsideCallingWindow = 0;
    const expectedVolume = totalRecipients - invalidNumbers - suppressedContacts;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        dryRunCompleted: true,
        dryRunReport: {
          totalRecipients,
          invalidNumbers,
          missingConsent,
          suppressedContacts,
          outsideCallingWindow,
          expectedCallVolume: expectedVolume,
          estimatedProviderCost: expectedVolume * 0.01,
          requiredConcurrency: campaign.concurrencyLimit,
        },
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('[CAMPAIGN DRY-RUN ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
