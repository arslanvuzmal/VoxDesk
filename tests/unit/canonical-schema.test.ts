import { describe, it, expect } from 'vitest';
import { VoiceAgentOutputSchema } from '@/lib/conversation/schemas/voice-agent-output';
import { validateStateTransition } from '@/lib/conversation/state-machine';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Canonical Output Schema & State Machine', () => {
  it('should validate a correct voice agent structured output', () => {
    const validData = {
      spokenReply: 'Hello, thank you for calling. How can I assist you?',
      detectedLanguage: 'en-US',
      intent: 'BOOKING',
      secondaryIntent: null,
      suggestedState: 'COLLECTING_REQUIREMENTS',
      sentiment: 'positive',
      urgency: 'medium',
      confidence: 0.95,
      extractedFields: { name: 'John Doe' },
      missingRequiredFields: ['phone'],
      suggestedAction: 'NONE',
      requiresHumanReview: false,
      handoffReason: null,
      knowledgeReferences: [],
      nextBestQuestion: 'What is your preferred callback number?',
      shouldEnd: false,
    };

    const parsed = VoiceAgentOutputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should validate safe state transitions', () => {
    const nextState = validateStateTransition('GREETING', 'IDENTIFYING_INTENT');
    expect(nextState).toBe('IDENTIFYING_INTENT');
  });

  it('should reject invalid state jumps', () => {
    const nextState = validateStateTransition('GREETING', 'BOOKING');
    expect(nextState).toBe('GREETING');
  });

  it('defines one channel-neutral conversation domain with persisted orchestration state', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');

    expect(schema).toContain('enum ConversationChannel');
    expect(schema).toContain('WEB_VOICE');
    expect(schema).toContain('WEB_TEXT');
    expect(schema).toContain('model Conversation {');
    expect(schema).toContain('model ConversationMessage {');
    expect(schema).toContain('model ConversationField {');
    expect(schema).toContain('model ConversationToolExecution {');
    expect(schema).toContain('model ConversationProviderCorrelation {');
    expect(schema).toContain('model ConversationState {');
  });

  it('enforces call correlation and tool idempotency in the database schema', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');

    expect(schema).toMatch(/callId\s+String\?\s+@unique/);
    expect(schema).toContain('@@unique([conversationId, operationFingerprint])');
    expect(schema).toContain('@@unique([provider, identifierType, identifierValue])');
  });

  it('links appointments to canonical conversations and contacts', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');

    expect(schema).toMatch(/model Appointment \{[\s\S]*contactId\s+String\?/);
    expect(schema).toMatch(/model Appointment \{[\s\S]*conversationId\s+String\?/);
    expect(schema).toMatch(/model Appointment \{[\s\S]*conversation\s+Conversation\?/);
    expect(schema).toContain('@@index([workspaceId, contactId, startTime])');
  });

  it('stores contact phone display metadata separately from encrypted and hashed values', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
    const contactModel = schema.split('model Contact {')[1].split('model Conversation {')[0];

    expect(contactModel).toContain('phoneEncrypted');
    expect(contactModel).toContain('phoneHash');
    expect(contactModel).toContain('phoneMasked');
    expect(contactModel).toContain('phoneLast4');
  });

  it('requires explicit campaign country capability configuration', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
    const migration = readFileSync(
      join(
        process.cwd(),
        'prisma',
        'migrations',
        '20260810160000_add_campaign_supported_countries',
        'migration.sql'
      ),
      'utf8'
    );
    expect(schema).toContain('supportedCountries   Json');
    expect(migration).toContain('ADD COLUMN "supportedCountries" JSONB');
  });

  it('models qualified opportunities with evidence instead of a magic score', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
    const opportunityModel = schema
      .split('model Opportunity {')[1]
      .split('model CalendarConnection {')[0];

    expect(schema).toContain('model Opportunity {');
    expect(opportunityModel).toContain('qualificationCriteria Json');
    expect(opportunityModel).toContain('evidence              Json');
    expect(opportunityModel).toContain('confidence            Float?');
    expect(opportunityModel).not.toMatch(/score\s+Float/);
  });

  it('ships an additive migration with conservative call and transcript backfill', () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        'prisma',
        'migrations',
        '20260809212000_add_canonical_conversations',
        'migration.sql'
      ),
      'utf8'
    );

    expect(migration).toContain('CREATE TABLE "conversations"');
    expect(migration).toContain('INSERT INTO "conversations"');
    expect(migration).toContain('INSERT INTO "conversation_messages"');
    expect(migration).toContain('INSERT INTO "conversation_provider_correlations"');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)/i);
    expect(migration).not.toMatch(/DELETE\s+FROM/i);
  });
});

