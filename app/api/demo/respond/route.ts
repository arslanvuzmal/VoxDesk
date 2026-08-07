import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { demoSessionStore } from '@/lib/demo/store';
import { isCloudflareAIEnabled } from '@/lib/providers/cloudflare/client.server';
import { generateCloudflareResponse } from '@/lib/providers/cloudflare/llm.server';
import { generateAgentTurn } from '@/lib/providers/openrouter.server';
import { checkAndRecordUsage, recordTurnUsage } from '@/lib/demo/usage-ledger';
import { withSessionLock } from '@/lib/demo/request-lock';
import { getOrganizationProfile } from '@/lib/organization/registry';
import { executeBusinessAction } from '@/lib/conversation/action-engine';
import { calculateLeadQualification } from '@/lib/conversation/qualification';
import { validateStateTransition } from '@/lib/conversation/state-machine';
import { VoiceAgentOutput } from '@/lib/conversation/schemas/voice-agent-output';
import { persistFinalCallResult } from '@/lib/database/persistence';

export async function POST(req: NextRequest) {
  const correlationId = `req_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  try {
    const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
    if (!cookieToken) {
      return NextResponse.json(
        {
          error: 'Missing session cookie. Please start a demo session.',
          code: 'MISSING_SESSION_COOKIE',
          correlationId,
          recoverable: false,
          guidedDemoUrl: '/demo/story',
        },
        { status: 401 }
      );
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json(
        {
          error: 'This demo session has expired. Please start a new call.',
          code: 'SESSION_EXPIRED',
          correlationId,
          recoverable: false,
          guidedDemoUrl: '/demo/story',
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const transcript = (body.transcript || '').trim().slice(0, 600);
    const clientTurnId = (
      body.clientTurnId || `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`
    ).slice(0, 64);

    if (!transcript) {
      return NextResponse.json(
        {
          error: 'No transcript provided. Please speak or type your input.',
          code: 'INVALID_TRANSCRIPT',
          correlationId,
          recoverable: true,
        },
        { status: 400 }
      );
    }

    // Process turn with session lock
    const result = await withSessionLock(session.sessionId, async () => {
      // 1. Idempotency Check
      const isDuplicate = await demoSessionStore.hasProcessedTurnId(
        session.sessionId,
        clientTurnId
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: true,
            duplicateTurn: true,
            code: 'DUPLICATE_TURN',
            message: 'Turn ID already processed.',
            correlationId,
          },
          { status: 409 }
        );
      }

      // 2. Usage Quotas & Limits
      const usageCheck = await checkAndRecordUsage(session.sessionId, transcript.length);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: usageCheck.reason,
            code: 'SESSION_LIMIT_REACHED',
            correlationId,
            recoverable: false,
            guidedDemoUrl: '/demo/story',
          },
          { status: 429 }
        );
      }

      await demoSessionStore.recordTurnId(session.sessionId, clientTurnId);

      // Load session source of truth
      const presetKey = session.presetKey || 'LEGAL';
      const language = (session.language as any) || 'en-US';
      const profile = getOrganizationProfile(presetKey);

      let agentOutput: VoiceAgentOutput | null = null;
      let providerLabel = 'Deterministic Profile Knowledge Engine';
      let fallbackUsed = false;

      // 3. Primary Cloudflare LLM Execution
      if (isCloudflareAIEnabled()) {
        try {
          agentOutput = await generateCloudflareResponse({
            userMessage: transcript,
            scenario: session.scenario as any,
            currentState: session.state,
            history: session.history || [],
            extractedFields: (session as any).accumulatedFields || {},
            presetKey,
            language,
          });
          providerLabel = 'Cloudflare Workers AI (@cf/moonshotai/kimi-k2.6)';
        } catch (cfErr) {
          console.warn('[CLOUDFLARE LLM ROUTE FALLBACK]:', cfErr);
          fallbackUsed = true;
        }
      }

      // 4. Secondary OpenRouter or Profile Deterministic Fallback
      if (!agentOutput) {
        const turnRes = await generateAgentTurn(
          session.scenario as any,
          transcript,
          session.history || [],
          { presetKey, language }
        );
        agentOutput = turnRes.data;
        fallbackUsed = turnRes.fallbackUsed;
        providerLabel = turnRes.fallbackUsed
          ? 'Deterministic Profile Knowledge Engine'
          : 'OpenRouter LLM';
      }

      // 5. Multi-Turn Field Accumulation (Section 8)
      const prevAccumulated = (session as any).accumulatedFields || {};
      const newExtracted = agentOutput.extractedFields || {};
      const mergedFields: Record<string, any> = { ...prevAccumulated };

      for (const [k, v] of Object.entries(newExtracted)) {
        if (v !== null && v !== undefined && v !== '') {
          mergedFields[k] = v;
        }
      }

      // 6. Server-Side State Machine Transition Validation (Section 9)
      const validatedState = validateStateTransition(
        session.state as any,
        agentOutput.suggestedState as any
      );

      // 7. Dynamic Lead Qualification Scoring
      const qualificationResult = calculateLeadQualification(
        {
          serviceInterest:
            mergedFields.serviceInterest ||
            mergedFields.legalCategory ||
            mergedFields.issueCategory ||
            profile.services[0]?.name,
          budgetRange:
            mergedFields.budgetRange || mergedFields.priceBudget || mergedFields.estimatedBudget,
          timeline: mergedFields.timeline || mergedFields.buyingTimeline,
          authority: mergedFields.authority || mergedFields.financingStatus,
          urgency: mergedFields.urgencyLevel || mergedFields.isEmergency,
          extractedFields: mergedFields,
        },
        profile
      );

      // 8. Deterministic Business Action Engine Execution
      const actionResult = await executeBusinessAction({
        actionType: agentOutput.suggestedAction as any,
        presetKey,
        sessionId: session.sessionId,
        transcriptText: transcript,
        extractedFields: mergedFields,
        userConfirmed: body.userConfirmed || false,
      });

      // 9. Evaluate Section 4 Call Termination Conditions
      const turnsUsedNext = session.turnsUsed + 1;
      const isMaxTurnsReached = turnsUsedNext >= session.maxTurns;
      const isCriticalEscalation =
        agentOutput.urgency === 'critical' || actionResult.actionType === 'PREPARE_HANDOFF';
      const shouldEndCall = agentOutput.shouldEnd || isMaxTurnsReached || isCriticalEscalation;

      // 10. Store TTS Response Voucher
      const storedResponse = await demoSessionStore.storeResponseId(
        session.sessionId,
        agentOutput.spokenReply
      );

      // 11. Record Usage Ledger
      await recordTurnUsage(
        session.sessionId,
        transcript.length,
        agentOutput.spokenReply.length,
        40,
        80
      );

      // 12. Update Session History & Accumulated Fields
      const updatedHistory = [
        ...(session.history || []),
        { role: 'CALLER' as const, text: transcript },
        { role: 'AGENT' as const, text: agentOutput.spokenReply },
      ].slice(-10);

      await demoSessionStore.updateSession(session.sessionId, {
        state: validatedState,
        turnsUsed: turnsUsedNext,
        history: updatedHistory,
        accumulatedFields: mergedFields,
      } as any);

      // 13. If call ends, persist transactional record graph to database
      let finalResultData: any = null;
      if (shouldEndCall) {
        const fullResult = {
          sessionId: session.sessionId,
          organization: {
            id: profile.id,
            name: profile.name,
            industry: profile.industry,
          },
          language,
          scenario: session.scenario as any,
          startedAt: new Date(session.createdAt).toISOString(),
          endedAt: new Date().toISOString(),
          durationSeconds: Math.round((Date.now() - session.createdAt) / 1000),
          turnsCompleted: turnsUsedNext,
          transcript: updatedHistory,
          accumulatedFields: mergedFields,
          summary: agentOutput.spokenReply,
          qualification: qualificationResult,
          businessActions: [actionResult],
          persistedRecords: {},
          providersUsed: {
            stt: {
              provider: 'BROWSER',
              language,
              success: true,
              fallbackUsed: false,
            },
            llm: {
              provider: fallbackUsed ? 'DETERMINISTIC' : 'CLOUDFLARE',
              language,
              success: true,
              fallbackUsed,
            },
            tts: {
              provider: 'DETERMINISTIC',
              language,
              success: true,
              fallbackUsed: false,
            },
          },
          degradedMode: fallbackUsed,
          warnings: [],
        };

        const dbRes = await persistFinalCallResult(fullResult as any);
        fullResult.persistedRecords = dbRes.recordIds;
        finalResultData = fullResult;
      }

      return NextResponse.json({
        success: true,
        responseId: storedResponse.responseId,
        spokenReply: agentOutput.spokenReply,
        detectedLanguage: agentOutput.detectedLanguage,
        intent: agentOutput.intent,
        conversationState: validatedState,
        extractedFields: mergedFields,
        missingRequiredFields: agentOutput.missingRequiredFields,
        qualificationResult,
        businessAction: actionResult,
        organizationProfile: {
          id: profile.id,
          name: profile.name,
          industry: profile.industry,
          voiceIdentity: profile.voiceIdentity,
        },
        shouldEnd: shouldEndCall,
        finalCallResult: finalResultData,
        fallbackUsed,
        providerLabel,
        turnsRemaining: Math.max(0, session.maxTurns - turnsUsedNext),
        actionTaken: actionResult.message,
        correlationId,
      });
    });

    return result;
  } catch (error: any) {
    if (error.message?.includes('CONCURRENT_REQUEST_BLOCKED')) {
      return NextResponse.json(
        {
          error: 'Concurrent request blocked for session.',
          code: 'CONCURRENT_REQUEST',
          correlationId,
          recoverable: true,
        },
        { status: 429 }
      );
    }

    console.error(`[RESPOND ROUTE ERROR] correlationId=${correlationId}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to process conversation turn.',
        code: 'PROVIDER_UNAVAILABLE',
        correlationId,
        recoverable: true,
      },
      { status: 500 }
    );
  }
}
