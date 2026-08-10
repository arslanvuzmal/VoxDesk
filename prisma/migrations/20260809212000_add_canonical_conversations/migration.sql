-- Additive canonical Conversation foundation. This migration does not remove or rewrite Call data.
CREATE TYPE "ConversationChannel" AS ENUM ('WEB_VOICE', 'PHONE', 'WEB_TEXT');
CREATE TYPE "ConversationDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERACTIVE');
CREATE TYPE "ConversationStatus" AS ENUM ('CREATED', 'ACTIVE', 'HUMAN_HANDOFF', 'FINALIZING', 'COMPLETED', 'FAILED');
CREATE TYPE "ConversationSpeaker" AS ENUM ('CUSTOMER', 'AGENT', 'HUMAN', 'SYSTEM');
CREATE TYPE "ConversationMessageType" AS ENUM ('TEXT', 'TRANSCRIPT', 'TOOL', 'EVENT');
CREATE TYPE "ConversationToolStatus" AS ENUM ('REQUESTED', 'AUTHORIZED', 'EXECUTING', 'SUCCEEDED', 'FAILED', 'BLOCKED');
CREATE TYPE "ConversationCompletenessStatus" AS ENUM ('COMPLETE', 'PARTIAL', 'NEEDS_REVIEW', 'PROVIDER_DATA_MISSING');

CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactId" TEXT,
    "channel" "ConversationChannel" NOT NULL,
    "direction" "ConversationDirection" NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'CREATED',
    "agentId" TEXT,
    "agentVersionId" TEXT,
    "trainingPackVersionId" TEXT,
    "languageProfileId" TEXT,
    "languageCode" TEXT,
    "provider" "ProviderType",
    "providerConversationId" TEXT,
    "callId" TEXT,
    "campaignId" TEXT,
    "intent" TEXT,
    "topic" TEXT,
    "urgency" TEXT,
    "sentiment" TEXT,
    "summary" TEXT,
    "resolution" TEXT,
    "outcome" TEXT,
    "ownerId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "completenessStatus" "ConversationCompletenessStatus" NOT NULL DEFAULT 'PARTIAL',
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "speaker" "ConversationSpeaker" NOT NULL,
    "type" "ConversationMessageType" NOT NULL,
    "text" TEXT,
    "providerEventId" TEXT,
    "sequence" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION,
    "language" TEXT,
    "redacted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_fields" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "safeValue" JSONB,
    "encryptedValue" TEXT,
    "sourceMessageId" TEXT,
    "confidence" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_fields_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_tool_executions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "operationFingerprint" TEXT,
    "safeInput" JSONB,
    "safeResult" JSONB,
    "status" "ConversationToolStatus" NOT NULL DEFAULT 'REQUESTED',
    "latencyMs" INTEGER,
    "errorCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversation_tool_executions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_provider_correlations" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_provider_correlations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_states" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "currentIntent" TEXT,
    "currentSpecialist" TEXT,
    "identityVerificationState" TEXT,
    "collectedFields" JSONB,
    "requestedOutcome" TEXT,
    "appointmentState" JSONB,
    "qualificationState" JSONB,
    "handoffState" JSONB,
    "followUpState" JSONB,
    "openTasks" JSONB,
    "toolResults" JSONB,
    "riskFlags" JSONB,
    "complianceFlags" JSONB,
    "conversationSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversation_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_callId_key" ON "conversations"("callId");
CREATE UNIQUE INDEX "conversations_correlationId_key" ON "conversations"("correlationId");
CREATE INDEX "conversations_workspaceId_status_startedAt_idx" ON "conversations"("workspaceId", "status", "startedAt");
CREATE INDEX "conversations_workspaceId_contactId_startedAt_idx" ON "conversations"("workspaceId", "contactId", "startedAt");
CREATE INDEX "conversations_workspaceId_channel_direction_startedAt_idx" ON "conversations"("workspaceId", "channel", "direction", "startedAt");
CREATE INDEX "conversations_businessId_startedAt_idx" ON "conversations"("businessId", "startedAt");
CREATE INDEX "conversations_agentId_startedAt_idx" ON "conversations"("agentId", "startedAt");
CREATE INDEX "conversations_campaignId_startedAt_idx" ON "conversations"("campaignId", "startedAt");
CREATE INDEX "conversations_providerConversationId_idx" ON "conversations"("providerConversationId");
CREATE UNIQUE INDEX "conversation_messages_conversationId_sequence_key" ON "conversation_messages"("conversationId", "sequence");
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages"("conversationId", "createdAt");
CREATE INDEX "conversation_messages_providerEventId_idx" ON "conversation_messages"("providerEventId");
CREATE INDEX "conversation_fields_conversationId_fieldKey_createdAt_idx" ON "conversation_fields"("conversationId", "fieldKey", "createdAt");
CREATE UNIQUE INDEX "conversation_tool_executions_conversationId_operationFingerprint_key" ON "conversation_tool_executions"("conversationId", "operationFingerprint");
CREATE INDEX "conversation_tool_executions_conversationId_createdAt_idx" ON "conversation_tool_executions"("conversationId", "createdAt");
CREATE INDEX "conversation_tool_executions_conversationId_status_idx" ON "conversation_tool_executions"("conversationId", "status");
CREATE UNIQUE INDEX "conversation_provider_correlations_provider_identifierType_identifierValue_key" ON "conversation_provider_correlations"("provider", "identifierType", "identifierValue");
CREATE INDEX "conversation_provider_correlations_conversationId_idx" ON "conversation_provider_correlations"("conversationId");
CREATE UNIQUE INDEX "conversation_states_conversationId_key" ON "conversation_states"("conversationId");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "voice_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "agent_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_trainingPackVersionId_fkey" FOREIGN KEY ("trainingPackVersionId") REFERENCES "business_training_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_languageProfileId_fkey" FOREIGN KEY ("languageProfileId") REFERENCES "language_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_fields" ADD CONSTRAINT "conversation_fields_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_tool_executions" ADD CONSTRAINT "conversation_tool_executions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_provider_correlations" ADD CONSTRAINT "conversation_provider_correlations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Conservative Call backfill. Calls without a configured business remain untouched for review.
INSERT INTO "conversations" (
    "id", "workspaceId", "businessId", "contactId", "channel", "direction", "status",
    "agentId", "agentVersionId", "languageProfileId", "languageCode", "provider",
    "providerConversationId", "callId", "campaignId", "outcome", "startedAt", "endedAt",
    "durationSeconds", "requiresReview", "completenessStatus", "correlationId", "createdAt", "updatedAt"
)
SELECT
    'conv_backfill_' || c."id",
    c."workspaceId",
    b."id",
    ct."id",
    CASE WHEN c."channel" = 'WEB' THEN 'WEB_VOICE'::"ConversationChannel" ELSE 'PHONE'::"ConversationChannel" END,
    c."direction"::text::"ConversationDirection",
    CASE
      WHEN c."status" = 'COMPLETED' THEN 'COMPLETED'::"ConversationStatus"
      WHEN c."status" = 'FAILED' THEN 'FAILED'::"ConversationStatus"
      ELSE 'ACTIVE'::"ConversationStatus"
    END,
    c."agentId",
    av."id",
    lp."id",
    c."language",
    c."provider",
    c."providerConversationId",
    c."id",
    ca."id",
    c."outcome"::text,
    c."startedAt",
    c."endedAt",
    NULLIF(c."durationSeconds", 0),
    CASE WHEN c."status" = 'COMPLETED' THEN false ELSE true END,
    CASE WHEN c."status" = 'COMPLETED' THEN 'PARTIAL'::"ConversationCompletenessStatus" ELSE 'NEEDS_REVIEW'::"ConversationCompletenessStatus" END,
    'backfill_call_' || c."id",
    c."createdAt",
    CURRENT_TIMESTAMP
FROM "calls" c
JOIN "business_profiles" b ON b."workspaceId" = c."workspaceId"
LEFT JOIN "contacts" ct ON ct."id" = c."contactId" AND ct."workspaceId" = c."workspaceId"
LEFT JOIN "agent_versions" av ON av."id" = c."agentVersionId" AND av."agentId" = c."agentId"
LEFT JOIN "language_profiles" lp ON lp."workspaceId" = c."workspaceId" AND lp."languageCode" = c."language"
LEFT JOIN "campaigns" ca ON ca."id" = c."campaignId" AND ca."workspaceId" = c."workspaceId"
WHERE NOT EXISTS (SELECT 1 FROM "conversations" existing WHERE existing."callId" = c."id");

INSERT INTO "conversation_messages" (
    "id", "conversationId", "speaker", "type", "text", "sequence", "startedAt", "endedAt",
    "confidence", "redacted", "createdAt"
)
SELECT
    'convmsg_backfill_' || ts."id",
    conv."id",
    CASE
      WHEN lower(ts."speaker") = 'agent' THEN 'AGENT'::"ConversationSpeaker"
      WHEN lower(ts."speaker") IN ('caller', 'customer') THEN 'CUSTOMER'::"ConversationSpeaker"
      ELSE 'SYSTEM'::"ConversationSpeaker"
    END,
    'TRANSCRIPT'::"ConversationMessageType",
    ts."text",
    row_number() OVER (PARTITION BY ts."callId" ORDER BY ts."startMs", ts."id")::integer,
    c."startedAt" + (ts."startMs" * interval '1 millisecond'),
    c."startedAt" + (ts."endMs" * interval '1 millisecond'),
    ts."confidence",
    ts."redacted",
    ts."createdAt"
FROM "transcript_segments" ts
JOIN "calls" c ON c."id" = ts."callId"
JOIN "conversations" conv ON conv."callId" = ts."callId"
WHERE NOT EXISTS (
  SELECT 1 FROM "conversation_messages" existing WHERE existing."id" = 'convmsg_backfill_' || ts."id"
);

UPDATE "conversations" conv
SET
    "summary" = cs."summary",
    "intent" = cs."intent",
    "sentiment" = cs."sentiment",
    "urgency" = cs."urgency",
    "updatedAt" = CURRENT_TIMESTAMP
FROM "call_summaries" cs
WHERE conv."callId" = cs."callId";

INSERT INTO "conversation_provider_correlations" (
    "id", "conversationId", "provider", "identifierType", "identifierValue", "createdAt"
)
SELECT 'corr_control_' || c."id", conv."id", 'TELNYX'::"ProviderType", 'TELNYX_CALL_CONTROL_ID', c."providerCallControlId", CURRENT_TIMESTAMP
FROM "calls" c JOIN "conversations" conv ON conv."callId" = c."id"
WHERE c."providerCallControlId" IS NOT NULL
UNION ALL
SELECT 'corr_session_' || c."id", conv."id", 'TELNYX'::"ProviderType", 'TELNYX_CALL_SESSION_ID', c."providerCallSessionId", CURRENT_TIMESTAMP
FROM "calls" c JOIN "conversations" conv ON conv."callId" = c."id"
WHERE c."providerCallSessionId" IS NOT NULL
UNION ALL
SELECT 'corr_leg_' || c."id", conv."id", 'TELNYX'::"ProviderType", 'TELNYX_CALL_LEG_ID', c."providerCallLegId", CURRENT_TIMESTAMP
FROM "calls" c JOIN "conversations" conv ON conv."callId" = c."id"
WHERE c."providerCallLegId" IS NOT NULL
UNION ALL
SELECT 'corr_elevenlabs_' || c."id", conv."id", 'ELEVENLABS'::"ProviderType", 'ELEVENLABS_CONVERSATION_ID', c."providerConversationId", CURRENT_TIMESTAMP
FROM "calls" c JOIN "conversations" conv ON conv."callId" = c."id"
WHERE c."providerConversationId" IS NOT NULL
ON CONFLICT ("provider", "identifierType", "identifierValue") DO NOTHING;
