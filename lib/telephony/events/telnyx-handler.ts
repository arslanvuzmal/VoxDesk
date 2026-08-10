import { NextResponse } from 'next/server';
import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import {
  ingestTelnyxEvent,
  markTelnyxJobCompleted,
  markTelnyxJobFailed,
  markTelnyxJobRunning,
} from '@/lib/telephony/events/telnyx-inbox';

export async function queueTelnyxEvent(
  event: IdentifiedTelnyxEvent,
  schedule: (task: () => Promise<void>) => void,
  process: (event: IdentifiedTelnyxEvent) => Promise<{ workspaceId?: string }>
): Promise<NextResponse> {
  const ingestion = await ingestTelnyxEvent(event);
  if (!ingestion.duplicate && ingestion.jobId) {
    schedule(async () => {
      try {
        await markTelnyxJobRunning(ingestion.jobId!, ingestion.providerEventRecordId);
        const result = await process(event);
        await markTelnyxJobCompleted(
          ingestion.jobId!,
          ingestion.providerEventRecordId,
          result.workspaceId
        );
      } catch {
        await markTelnyxJobFailed(ingestion.jobId!, ingestion.providerEventRecordId);
      }
    });
  }
  return NextResponse.json(
    {
      data: { received: true, queued: !ingestion.duplicate, duplicate: ingestion.duplicate },
      meta: { correlationId: ingestion.correlationId },
    },
    { status: ingestion.duplicate ? 200 : 202 }
  );
}

