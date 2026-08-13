import 'server-only';

import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import { CallStateMachine } from '@/lib/telephony/call-state-machine';
import type { CallState, NormalizedEventType } from '@/lib/telephony/contracts';
import { getTelephonyMode } from '@/lib/telephony/mode';
import { getTelephonyProvider } from '@/lib/telephony/providers/factory';
import { executeDatabaseTool } from '@/lib/voice-agent/tool-executor';
import type { ConversationContext } from '@/lib/security/conversation-context';

export const SIMULATION_SCENARIOS = [
  'inbound-consultation',
  'qualified-lead',
  'appointment-booked',
  'support-resolution',
  'human-escalation',
  'voicemail',
  'no-answer',
  'opt-out',
  'provider-failure',
] as const;

export type SimulationScenario = (typeof SIMULATION_SCENARIOS)[number];

type SimulationDefinition = {
  direction: 'INBOUND' | 'OUTBOUND';
  intent: string;
  outcome: string | null;
  terminal: 'COMPLETED' | 'NO_ANSWER' | 'VOICEMAIL' | 'FAILED';
  transcript: Array<{ speaker: 'CUSTOMER' | 'AGENT'; text: string }>;
};

const DEFINITIONS: Record<SimulationScenario, SimulationDefinition> = {
  'inbound-consultation': {
    direction: 'INBOUND',
    intent: 'Simulation: inbound consultation',
    outcome: 'LEAD_QUALIFIED',
    terminal: 'COMPLETED',
    transcript: [
      { speaker: 'AGENT', text: 'Simulation greeting: Northstar Legal. How may I help?' },
      { speaker: 'CUSTOMER', text: 'I was involved in a vehicle accident and need advice.' },
      {
        speaker: 'AGENT',
        text: 'I can collect preliminary details and arrange a consultation in this simulation.',
      },
    ],
  },
  'qualified-lead': {
    direction: 'OUTBOUND',
    intent: 'Simulation: consultation qualification',
    outcome: 'LEAD_QUALIFIED',
    terminal: 'COMPLETED',
    transcript: [
      { speaker: 'AGENT', text: 'Simulation greeting: Northstar Legal. How may I help?' },
      { speaker: 'CUSTOMER', text: 'I need a consultation after a vehicle accident.' },
      { speaker: 'AGENT', text: 'I can collect preliminary details and arrange the next step.' },
    ],
  },
  'appointment-booked': {
    direction: 'OUTBOUND',
    intent: 'Simulation: appointment booking',
    outcome: 'APPOINTMENT_SCHEDULED',
    terminal: 'COMPLETED',
    transcript: [
      { speaker: 'AGENT', text: 'Simulation greeting: Northstar Legal. How may I help?' },
      { speaker: 'CUSTOMER', text: 'I would like to schedule a consultation.' },
      {
        speaker: 'AGENT',
        text: 'I found an available consultation slot and confirmed it in this simulation.',
      },
    ],
  },
  'support-resolution': {
    direction: 'OUTBOUND',
    intent: 'Simulation: service question',
    outcome: 'QUESTION_ANSWERED',
    terminal: 'COMPLETED',
    transcript: [
      { speaker: 'AGENT', text: 'Simulation greeting: Northstar Legal. How may I help?' },
      { speaker: 'CUSTOMER', text: 'I have a question about the consultation process.' },
      { speaker: 'AGENT', text: 'I have recorded your request and created a follow-up task.' },
    ],
  },
  'human-escalation': {
    direction: 'OUTBOUND',
    intent: 'Simulation: human escalation',
    outcome: 'ESCALATED_HUMAN',
    terminal: 'COMPLETED',
    transcript: [
      { speaker: 'AGENT', text: 'Simulation greeting: Northstar Legal. How may I help?' },
      { speaker: 'CUSTOMER', text: 'I need to speak with a person about an urgent issue.' },
      { speaker: 'AGENT', text: 'I have prepared a simulated handoff record for the human team.' },
    ],
  },
  voicemail: {
    direction: 'OUTBOUND',
    intent: 'Simulation: voicemail',
    outcome: null,
    terminal: 'VOICEMAIL',
    transcript: [],
  },
  'no-answer': {
    direction: 'OUTBOUND',
    intent: 'Simulation: no answer',
    outcome: null,
    terminal: 'NO_ANSWER',
    transcript: [],
  },
  'opt-out': {
    direction: 'OUTBOUND',
    intent: 'Simulation: opt-out request',
    outcome: 'CALLER_DISCONNECTED',
    terminal: 'COMPLETED',
    transcript: [
      {
        speaker: 'AGENT',
        text: 'Simulation outbound disclosure: this is a simulated service follow-up.',
      },
      { speaker: 'CUSTOMER', text: 'Please do not call me again.' },
      { speaker: 'AGENT', text: 'Your simulated opt-out request has been recorded.' },
    ],
  },
  'provider-failure': {
    direction: 'OUTBOUND',
    intent: 'Simulation: provider failure',
    outcome: null,
    terminal: 'FAILED',
    transcript: [],
  },
};

export class SimulationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationConfigurationError';
  }
}

type SimulationContext = Omit<ConversationContext, 'conversationId'> & {
  languageProfileId: string | null;
  agentVersionNumber: number;
};

async function resolveSimulationContext(
  workspaceId: string,
  direction: SimulationContext['direction']
): Promise<SimulationContext> {
  const business = await prisma.businessProfile.findUnique({
    where: { workspaceId },
    select: { id: true, defaultLanguage: true, timezone: true },
  });
  const agent = await prisma.voiceAgent.findFirst({
    where: { workspaceId, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, language: true },
  });
  if (!business || !agent) {
    throw new SimulationConfigurationError(
      'A business profile and active voice agent are required before running a simulation.'
    );
  }
  const [agentVersion, trainingPack, languageProfile] = await Promise.all([
    prisma.agentVersion.findFirst({
      where: { agentId: agent.id },
      orderBy: { versionNumber: 'desc' },
      select: { id: true, versionNumber: true },
    }),
    prisma.businessTrainingPack.findFirst({
      where: { workspaceId, agentId: agent.id },
      orderBy: { versionNumber: 'desc' },
      select: { id: true },
    }),
    prisma.languageProfile.findFirst({
      where: { workspaceId, languageCode: agent.language },
      select: { id: true },
    }),
  ]);
  if (!agentVersion || !trainingPack) {
    throw new SimulationConfigurationError(
      'An agent version and business training pack are required before running a simulation.'
    );
  }
  return {
    workspaceId,
    businessId: business.id,
    contactId: null,
    agentId: agent.id,
    agentVersionId: agentVersion.id,
    trainingPackVersionId: trainingPack.id,
    channel: 'PHONE',
    direction,
    language: agent.language || business.defaultLanguage,
    languageProfileId: languageProfile?.id || null,
    agentVersionNumber: agentVersion.versionNumber,
  };
}

function nextFutureSlot(): { startTime: string; endTime: string } {
  const start = new Date(Date.now() + 48 * 60 * 60 * 1000);
  start.setUTCHours(15, 30, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

async function executeTool(
  tool: Parameters<typeof executeDatabaseTool>[0],
  context: ConversationContext,
  parameters: Record<string, unknown>
): Promise<Prisma.JsonObject> {
  return executeDatabaseTool(tool, `sim_tool_${crypto.randomUUID()}`, parameters, context);
}

export async function runTelephonySimulation(input: {
  workspaceId: string;
  scenario: SimulationScenario;
  initiatedBy: string;
}) {
  if (getTelephonyMode() !== 'simulation') {
    throw new SimulationConfigurationError(
      'Simulation is disabled while TELEPHONY_MODE=live. Live mode never falls back to simulation.'
    );
  }
  const definition = DEFINITIONS[input.scenario];
  const context = await resolveSimulationContext(input.workspaceId, definition.direction);
  const provider = getTelephonyProvider();
  const providerCall = await provider.startCall({
    workspaceId: context.workspaceId,
    businessId: context.businessId,
    agentId: context.agentId,
    agentVersionId: context.agentVersionId,
    callerNumber: 'SIMULATED_CALLER',
    callerName: 'Simulation caller',
    direction: definition.direction,
    channel: 'PHONE',
    language: context.language,
    trainingPackVersion: context.agentVersionNumber,
  });
  const correlationId = `sim_${crypto.randomUUID()}`;

  const created = await prisma.$transaction(async tx => {
    const call = await tx.call.create({
      data: {
        workspaceId: context.workspaceId,
        agentId: context.agentId,
        agentVersionId: context.agentVersionId,
        provider: 'SIMULATION',
        executionMode: 'SIMULATION',
        simulationScenario: input.scenario,
        simulationVersion: '2026-08-12.1',
        providerCallControlId: providerCall.providerCallControlId,
        providerCallSessionId: providerCall.providerCallSessionId,
        direction: definition.direction,
        channel: 'PHONE',
        language: context.language,
        callerNumberMasked: 'Simulation caller',
        callerName: 'Simulation caller',
        status: 'INITIATED',
        recordingConsent: false,
        recordingConsentState: 'RECORDING_DISABLED',
      },
    });
    const conversation = await tx.conversation.create({
      data: {
        workspaceId: context.workspaceId,
        businessId: context.businessId,
        channel: 'PHONE',
        direction: definition.direction,
        status: 'ACTIVE',
        agentId: context.agentId,
        agentVersionId: context.agentVersionId,
        trainingPackVersionId: context.trainingPackVersionId,
        languageProfileId: context.languageProfileId,
        languageCode: context.language,
        provider: 'SIMULATION',
        callId: call.id,
        intent: definition.intent,
        correlationId,
      },
    });
    return { call, conversation };
  });

  const machine = CallStateMachine.createInitialContext({
    id: created.call.id,
    workspaceId: context.workspaceId,
    businessId: context.businessId,
    agentId: context.agentId,
    agentVersionId: context.agentVersionId,
    direction: definition.direction,
    channel: 'PHONE',
    provider: 'SIMULATION',
    providerCallControlId: providerCall.providerCallControlId,
    providerCallSessionId: providerCall.providerCallSessionId,
    callerNumber: 'SIMULATED_CALLER',
    callerName: 'Simulation caller',
    language: context.language,
    trainingPackVersion: context.agentVersionNumber,
    recordingConsent: false,
  });
  const stateMachine = new CallStateMachine(machine);
  const timeline: Array<{ state: string; event: string; at: string }> = [];
  const apply = (state: CallState, event: NormalizedEventType) => {
    const providerEventId = `sim_event_${crypto.randomUUID()}`;
    stateMachine.transitionTo(state, {
      type: event,
      providerEventId,
      payload: { simulation: true, scenario: input.scenario, timestamp: new Date().toISOString() },
    });
    timeline.push({ state, event, at: new Date().toISOString() });
  };
  apply('INITIATING', 'CALL_INITIATED');
  apply('RINGING', 'CALL_RINGING');

  if (definition.terminal === 'NO_ANSWER' || definition.terminal === 'VOICEMAIL') {
    apply(
      definition.terminal,
      definition.terminal === 'NO_ANSWER' ? 'CALL_HANGUP' : 'CALL_MACHINE_DETECTED'
    );
  } else if (definition.terminal === 'FAILED') {
    apply('FAILED', 'CALL_FAILED');
    stateMachine.setTerminationReason('FAILED_PROVIDER');
  } else {
    apply('ANSWERED', 'CALL_ANSWERED');
    apply('AGENT_CONNECTING', 'CALL_BRIDGED');
    apply('ACTIVE', 'CALL_BRIDGED');
  }

  let toolContext: ConversationContext = {
    ...context,
    conversationId: created.conversation.id,
  };
  const toolResults: Array<{ tool: string; result: Prisma.JsonObject }> = [];
  if (definition.terminal === 'COMPLETED') {
    const contact = await executeTool('create_or_update_contact', toolContext, {
      name: 'Avery Morgan (Simulation)',
      company: 'Simulation record',
    });
    toolResults.push({ tool: 'create_or_update_contact', result: contact });
    toolContext = { ...toolContext, contactId: String(contact.contactId) };

    if (input.scenario === 'qualified-lead') {
      toolResults.push({
        tool: 'create_opportunity',
        result: await executeTool('create_opportunity', toolContext, {
          title: 'Simulation consultation opportunity',
          serviceInterest: 'Simulation vehicle accident consultation',
          qualificationCriteria: ['Consultation requested', 'Incident context supplied'],
          evidence: ['Simulation transcript includes a consultation request'],
          confidence: 0.8,
          recommendation: 'Human review recommended after the simulated intake.',
        }),
      });
    }
    if (input.scenario === 'appointment-booked') {
      const slot = nextFutureSlot();
      toolResults.push({
        tool: 'check_availability',
        result: await executeTool('check_availability', toolContext, slot),
      });
      toolResults.push({
        tool: 'book_appointment',
        result: await executeTool('book_appointment', toolContext, {
          ...slot,
          service: 'Simulation consultation',
        }),
      });
    }
    if (input.scenario === 'support-resolution') {
      toolResults.push({
        tool: 'create_task',
        result: await executeTool('create_task', toolContext, {
          title: 'Simulation: review service question',
          description: 'Created from a deterministic telephony simulation.',
          priority: 'MEDIUM',
        }),
      });
    }
    if (input.scenario === 'opt-out') {
      // A simulated number is deliberately used only inside the isolated record.
      const simulatedContact = await executeTool('create_or_update_contact', toolContext, {
        name: 'Avery Morgan (Simulation)',
        phone: '+15550101773',
      });
      toolContext = { ...toolContext, contactId: String(simulatedContact.contactId) };
      toolResults.push({
        tool: 'record_opt_out',
        result: await executeTool('record_opt_out', toolContext, {}),
      });
    }
    if (input.scenario === 'human-escalation') {
      apply('HUMAN_TRANSFER_PENDING', 'CALL_TRANSFERRED');
      toolResults.push({
        tool: 'request_human_handoff',
        result: await executeTool('request_human_handoff', toolContext, {
          reason: 'Simulation: customer requested human assistance',
          mode: 'TASK',
          brief:
            'No external transfer was attempted; a simulated human-operations task was requested.',
        }),
      });
    }
    apply('ENDING', 'CALL_HANGUP');
    apply('COMPLETED', 'CALL_HANGUP');
  }

  const finalContext = stateMachine.getContext();
  const finalStatus =
    definition.terminal === 'COMPLETED'
      ? 'COMPLETED'
      : definition.terminal === 'FAILED'
        ? 'FAILED'
        : 'NO_ANSWER';
  const eventData = finalContext.events.map((event, index) => ({
    callId: created.call.id,
    eventType: event.eventType,
    providerEventId: event.providerEventId,
    sequence: index + 1,
    occurredAt: event.providerTimestamp,
    safePayload: { ...event.payload, executionMode: 'SIMULATION' },
    correlationId,
    processingStatus: 'PROCESSED',
  }));
  await prisma.$transaction(async tx => {
    if (eventData.length) await tx.callEvent.createMany({ data: eventData });
    if (definition.transcript.length) {
      await tx.transcriptSegment.createMany({
        data: definition.transcript.map((turn, index) => ({
          callId: created.call.id,
          speaker: turn.speaker === 'CUSTOMER' ? 'caller' : 'agent',
          text: turn.text,
          startMs: index * 8_000,
          endMs: (index + 1) * 8_000,
        })),
      });
      await tx.conversationMessage.createMany({
        data: definition.transcript.map((turn, index) => ({
          conversationId: created.conversation.id,
          speaker: turn.speaker,
          type: 'TRANSCRIPT',
          text: turn.text,
          sequence: index + 1,
          language: context.language,
        })),
      });
    }
    await tx.call.update({
      where: { id: created.call.id },
      data: {
        status: finalStatus,
        endedAt: new Date(),
        durationSeconds: definition.transcript.length * 8,
        terminationReason:
          definition.terminal === 'FAILED'
            ? 'FAILED_PROVIDER'
            : definition.terminal === 'NO_ANSWER'
              ? 'NO_ANSWER'
              : definition.terminal === 'VOICEMAIL'
                ? 'VOICEMAIL'
                : 'AGENT_HANGUP',
        outcome: definition.outcome as never,
      },
    });
    await tx.conversation.update({
      where: { id: created.conversation.id },
      data: {
        contactId: toolContext.contactId,
        status: definition.terminal === 'FAILED' ? 'FAILED' : 'COMPLETED',
        outcome: definition.outcome,
        summary: `Simulation — ${definition.intent}. No external phone call was placed.`,
        endedAt: new Date(),
        durationSeconds: definition.transcript.length * 8,
        completenessStatus: definition.terminal === 'FAILED' ? 'NEEDS_REVIEW' : 'COMPLETE',
        requiresReview: definition.terminal === 'FAILED',
      },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: context.workspaceId,
        userId: input.initiatedBy.startsWith('demo-session:') ? undefined : input.initiatedBy,
        action: 'TELEPHONY_SIMULATION_COMPLETED',
        entityType: 'CALL',
        entityId: created.call.id,
        metadata: {
          scenario: input.scenario,
          correlationId,
          executionMode: 'SIMULATION',
          initiatedBy: input.initiatedBy,
        },
      },
    });
  });

  return {
    callId: created.call.id,
    conversationId: created.conversation.id,
    scenario: input.scenario,
    executionMode: 'SIMULATION' as const,
    disclosure: 'Simulation — no external phone call was placed.',
    timeline,
    toolResults,
  };
}
