import { NextResponse } from 'next/server';
import {
  getElevenLabsProviderEventId,
  ingestElevenLabsPostCall,
  markElevenLabsJobCompleted,
  markElevenLabsJobFailed,
  markElevenLabsJobRunning,
  reconcileElevenLabsPostCall,
  type ElevenLabsPostCall,
} from '@/lib/voice-agent/elevenlabs-postcall';

export async function queueElevenLabsPostCall(
  rawBody: string,
  event: ElevenLabsPostCall,
  schedule: (task: () => Promise<void>) => void
): Promise<NextResponse> {
  const ingestion = await ingestElevenLabsPostCall(rawBody, event);
  if (!ingestion.duplicate && ingestion.jobId) {
    schedule(async () => {
      try {
        await markElevenLabsJobRunning(ingestion.jobId!, ingestion.providerEventRecordId);
        const result = await reconcileElevenLabsPostCall(
          event,
          getElevenLabsProviderEventId(event)
        );
        await markElevenLabsJobCompleted(
          ingestion.jobId!,
          ingestion.providerEventRecordId,
          result.workspaceId
        );
      } catch {
        await markElevenLabsJobFailed(ingestion.jobId!, ingestion.providerEventRecordId, 'UNKNOWN');
      }
    });
  }
  return NextResponse.json({
    data: { received: true, queued: !ingestion.duplicate, duplicate: ingestion.duplicate },
    meta: { correlationId: ingestion.correlationId },
  });
}

