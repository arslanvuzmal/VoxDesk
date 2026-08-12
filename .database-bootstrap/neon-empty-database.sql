-- Generated from the canonical Prisma schema for one-time empty-database initialization.
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('APPOINTMENT_SCHEDULED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'LEAD_QUALIFIED', 'LEAD_REJECTED', 'QUESTION_ANSWERED', 'ESCALATED_HUMAN', 'CALLBACK_REQUESTED', 'CALLER_DISCONNECTED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "CallChannel" AS ENUM ('WEB', 'PHONE', 'SIP');

-- CreateEnum
CREATE TYPE "CallTerminationReason" AS ENUM ('CALLER_HANGUP', 'RECIPIENT_HANGUP', 'AGENT_HANGUP', 'HUMAN_HANGUP', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'FAILED_PROVIDER', 'FAILED_AGENT', 'FAILED_TOOL', 'TIME_LIMIT', 'COMPLIANCE_BLOCK', 'ADMIN_CANCELLED');

-- CreateEnum
CREATE TYPE "RecordingConsentState" AS ENUM ('NOT_REQUESTED', 'DISCLOSURE_REQUIRED', 'CONSENT_REQUESTED', 'CONSENT_GRANTED', 'CONSENT_DECLINED', 'RECORDING_DISABLED');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('WEB_VOICE', 'PHONE', 'WEB_TEXT');

-- CreateEnum
CREATE TYPE "ConversationDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('CREATED', 'ACTIVE', 'HUMAN_HANDOFF', 'FINALIZING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConversationSpeaker" AS ENUM ('CUSTOMER', 'AGENT', 'HUMAN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationMessageType" AS ENUM ('TEXT', 'TRANSCRIPT', 'TOOL', 'EVENT');

-- CreateEnum
CREATE TYPE "ConversationToolStatus" AS ENUM ('REQUESTED', 'AUTHORIZED', 'PENDING_APPROVAL', 'EXECUTING', 'SUCCEEDED', 'FAILED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ToolPolicyOutcome" AS ENUM ('ALLOW', 'DENY', 'ESCALATE');

-- CreateEnum
CREATE TYPE "ToolApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "ConversationCompletenessStatus" AS ENUM ('COMPLETE', 'PARTIAL', 'NEEDS_REVIEW', 'PROVIDER_DATA_MISSING');

-- CreateEnum
CREATE TYPE "CampaignState" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignRecipientState" AS ENUM ('PENDING', 'SUPPRESSED', 'QUEUED', 'DIALING', 'RINGING', 'ANSWERED', 'COMPLETED', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'FAILED', 'OPTED_OUT', 'FOLLOW_UP_REQUIRED');

-- CreateEnum
CREATE TYPE "OutboundWorkflowType" AS ENUM ('APPOINTMENT_REMINDER', 'REQUESTED_CALLBACK', 'CUSTOMER_FOLLOW_UP', 'MISSING_INFORMATION_REMINDER', 'SERVICE_UPDATE', 'CONSENTED_LEAD_FOLLOW_UP', 'SURVEY_REQUEST');

-- CreateEnum
CREATE TYPE "ConsentCategory" AS ENUM ('EXPRESS_CONSENT', 'IMPLIED_CONSENT', 'EXISTING_BUSINESS_RELATIONSHIP', 'LEGAL_OBLIGATION', 'VITAL_INTEREST', 'PUBLIC_TASK');

-- CreateEnum
CREATE TYPE "LanguageStatus" AS ENUM ('NOT_CONFIGURED', 'CONTENT_INCOMPLETE', 'PROVIDER_SUPPORTED', 'TESTING', 'VERIFIED', 'DEGRADED', 'DISABLED');

-- CreateEnum
CREATE TYPE "ImprovementObservationCategory" AS ENUM ('UNANSWERED_BUSINESS_QUESTION', 'INCORRECT_BUSINESS_INFORMATION', 'REPEATED_QUESTION', 'MISSED_REQUIRED_FIELD', 'TOOL_FAILURE', 'WRONG_ACTION', 'FAILED_CONFIRMATION', 'POOR_HANDOFF', 'LANGUAGE_ERROR', 'PRONUNCIATION_ERROR', 'CALLER_INTERRUPTION_FAILURE', 'LONG_RESPONSE', 'UNSAFE_RESPONSE', 'OUTBOUND_DISCLOSURE_FAILURE', 'OPT_OUT_FAILURE', 'PROVIDER_FAILURE');

-- CreateEnum
CREATE TYPE "ImprovementProposalType" AS ENUM ('KNOWLEDGE_UPDATE', 'PROMPT_ADJUSTMENT', 'CONVERSATION_RULE', 'TOOL_SCHEMA_CHANGE', 'TOOL_RETRY_POLICY', 'ESCALATION_RULE', 'LANGUAGE_CONTENT_UPDATE', 'PRONUNCIATION_UPDATE', 'EVALUATION_CASE', 'UI_WORKFLOW_CHANGE');

-- CreateEnum
CREATE TYPE "ImprovementProposalStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EVALUATION_RUNNING', 'EVALUATION_PASSED', 'EVALUATION_FAILED', 'CANARY_DEPLOYED', 'PROMOTED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('DETERMINISTIC', 'MODEL_BASED');

-- CreateEnum
CREATE TYPE "DeploymentState" AS ENUM ('CANDIDATE', 'SHADOW', 'CANARY', 'PRODUCTION', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "LeadCategory" AS ENUM ('HOT', 'WARM', 'REVIEW', 'COLD');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('QUALIFIED', 'DISCOVERY', 'PROPOSAL', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('SIMULATION', 'DEMO', 'TWILIO', 'VAPI', 'RETELL', 'LIVEKIT', 'DEEPGRAM', 'ELEVENLABS', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'OPENROUTER', 'GOOGLE_CALENDAR', 'CALCOM', 'HUBSPOT', 'GENERIC_WEBHOOK', 'TELNYX');

-- CreateEnum
CREATE TYPE "CallExecutionMode" AS ENUM ('SIMULATION', 'LIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "systemRole" "SystemRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'general',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'OPERATOR',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'OPERATOR',
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "openingHours" JSONB,
    "holidayRules" JSONB,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en-US',
    "escalationNumberEncrypted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_agents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "businessProfileId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "voiceProvider" "ProviderType" NOT NULL DEFAULT 'DEMO',
    "voiceId" TEXT NOT NULL DEFAULT 'demo-voice-maya',
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "greeting" TEXT NOT NULL,
    "systemInstructions" TEXT NOT NULL,
    "calendarConnectionId" TEXT,
    "crmConnectionId" TEXT,
    "qualificationRuleId" TEXT,
    "escalationPolicyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_versions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "greeting" TEXT NOT NULL,
    "systemInstructions" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "businessId" TEXT,
    "agentId" TEXT,
    "languageProfileId" TEXT,
    "trainingPackVersionId" TEXT,
    "numberEncrypted" TEXT,
    "numberHash" TEXT,
    "numberMasked" TEXT NOT NULL,
    "numberLast4" TEXT,
    "provider" "ProviderType" NOT NULL DEFAULT 'DEMO',
    "providerId" TEXT,
    "voiceProviderPhoneNumberId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "encryptedCredential" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastHealthCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_items" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "content" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "source" TEXT,
    "ownerId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualification_rules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetPhoneEnc" TEXT,
    "triggers" JSONB NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'TRANSFER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentVersionId" TEXT,
    "provider" "ProviderType" NOT NULL DEFAULT 'DEMO',
    "executionMode" "CallExecutionMode" NOT NULL DEFAULT 'LIVE',
    "simulationScenario" TEXT,
    "simulationVersion" TEXT,
    "providerCallControlId" TEXT,
    "providerCallSessionId" TEXT,
    "providerCallLegId" TEXT,
    "providerConversationId" TEXT,
    "direction" "CallDirection" NOT NULL DEFAULT 'INBOUND',
    "channel" TEXT NOT NULL DEFAULT 'PHONE',
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "fromNumberEncrypted" TEXT,
    "toNumberEncrypted" TEXT,
    "fromNumberHash" TEXT,
    "toNumberHash" TEXT,
    "callerNumberMasked" TEXT NOT NULL,
    "callerName" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "terminationReason" TEXT,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "recordingConsentState" "RecordingConsentState" NOT NULL DEFAULT 'NOT_REQUESTED',
    "outcome" "CallOutcome",
    "qualificationCategory" "LeadCategory",
    "qualificationScore" DOUBLE PRECISION,
    "appointmentId" TEXT,
    "leadId" TEXT,
    "contactId" TEXT,
    "campaignId" TEXT,
    "escalationUsed" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_legs" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "legType" TEXT NOT NULL,
    "providerLegId" TEXT,
    "direction" TEXT NOT NULL,
    "fromNumber" TEXT,
    "toNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "sipHeaders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_legs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_participants" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "participantType" TEXT NOT NULL,
    "identifier" TEXT,
    "name" TEXT,
    "role" TEXT,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_tool_executions" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "parameters" JSONB,
    "result" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_tool_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_recordings" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "recordingPath" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "fileSizeBytes" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'mp3',
    "retentionPolicy" TEXT,
    "accessUrl" TEXT,
    "accessExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_evaluations" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "evaluatorType" TEXT NOT NULL,
    "evaluatorVersion" TEXT NOT NULL,
    "rubricVersion" TEXT,
    "category" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "evidence" JSONB,
    "confidence" DOUBLE PRECISION,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_events" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "providerEventId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventTime" TIMESTAMP(3),
    "normalizedType" TEXT,
    "safePayload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_segments" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "redacted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_summaries" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "actionItems" JSONB NOT NULL,
    "commitments" JSONB NOT NULL,
    "followUpRecommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "callId" TEXT,
    "name" TEXT NOT NULL,
    "phoneEncrypted" TEXT,
    "emailEncrypted" TEXT,
    "company" TEXT,
    "serviceInterest" TEXT,
    "budgetRange" TEXT,
    "timeline" TEXT,
    "authority" TEXT,
    "urgency" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" "LeadCategory" NOT NULL DEFAULT 'WARM',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "sourceConversationId" TEXT,
    "title" TEXT NOT NULL,
    "serviceInterest" TEXT,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'QUALIFIED',
    "qualificationCriteria" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "recommendation" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL DEFAULT 'DEMO',
    "displayName" TEXT NOT NULL,
    "encryptedCredential" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "conversationId" TEXT,
    "callId" TEXT,
    "calendarConnectionId" TEXT,
    "externalEventId" TEXT,
    "callerName" TEXT NOT NULL,
    "callerContactEncrypted" TEXT,
    "service" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "confirmationStatus" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL DEFAULT 'DEMO',
    "displayName" TEXT NOT NULL,
    "encryptedCredential" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_activities" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "crmConnectionId" TEXT,
    "activityType" TEXT NOT NULL,
    "externalId" TEXT,
    "details" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SYNCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY['call.completed', 'appointment.created', 'lead.qualified']::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "webhookEndpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "responseCode" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "voiceAgentId" TEXT,
    "voiceId" TEXT,
    "speechProvider" TEXT NOT NULL DEFAULT 'elevenlabs',
    "telephonySupported" BOOLEAN NOT NULL DEFAULT false,
    "webSupported" BOOLEAN NOT NULL DEFAULT false,
    "businessContentComplete" BOOLEAN NOT NULL DEFAULT false,
    "disclosureContentComplete" BOOLEAN NOT NULL DEFAULT false,
    "pronunciationConfigured" BOOLEAN NOT NULL DEFAULT false,
    "evaluationStatus" TEXT NOT NULL DEFAULT 'NOT_EVALUATED',
    "lastVerifiedAt" TIMESTAMP(3),
    "fallbackLanguage" TEXT,
    "humanFallback" BOOLEAN NOT NULL DEFAULT true,
    "status" "LanguageStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sip_trunks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'TELNYX',
    "trunkName" TEXT NOT NULL,
    "sipUsername" TEXT NOT NULL,
    "sipPasswordEncrypted" TEXT NOT NULL,
    "trunkId" TEXT,
    "tlsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "srtpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mediaEncryption" BOOLEAN NOT NULL DEFAULT true,
    "elevenlabsDestination" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "webhookUrl" TEXT,
    "webhookSecretHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sip_trunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telephony_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'TELNYX',
    "connectionName" TEXT NOT NULL,
    "connectionId" TEXT,
    "outboundProfileId" TEXT,
    "webhookUrl" TEXT,
    "webhookFailoverUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastHealthCheck" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telephony_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_concurrency_leases" (
    "id" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "callId" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "heartbeatAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_concurrency_leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "consentType" TEXT NOT NULL DEFAULT 'OUTBOUND_CALL',
    "consentStatus" TEXT NOT NULL DEFAULT 'NOT_RECORDED',
    "source" TEXT,
    "evidence" JSONB,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "jurisdiction" TEXT NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppression_entries" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "phoneHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'DO_NOT_CALL',
    "suppressedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppression_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_preferences" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en-US',
    "preferredChannel" TEXT NOT NULL DEFAULT 'PHONE',
    "timeZone" TEXT NOT NULL DEFAULT 'America/New_York',
    "doNotCall" BOOLEAN NOT NULL DEFAULT false,
    "doNotText" BOOLEAN NOT NULL DEFAULT false,
    "doNotEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessId" TEXT,
    "workflowType" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentVersionId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "callerId" TEXT,
    "targetSegment" TEXT,
    "callingWindowStart" TEXT,
    "callingWindowEnd" TEXT,
    "timezoneStrategy" TEXT NOT NULL DEFAULT 'LOCAL',
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "retryIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "concurrencyLimit" INTEGER NOT NULL DEFAULT 2,
    "callsPerMinute" INTEGER NOT NULL DEFAULT 5,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "dryRunCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dryRunReport" JSONB,
    "state" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "failedReason" TEXT,
    "openingDisclosure" TEXT,
    "supportedCountries" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_recipients" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT,
    "recipientName" TEXT,
    "recipientPhoneEncrypted" TEXT,
    "recipientPhoneHash" TEXT,
    "recipientEmailEncrypted" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'US',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "outcome" TEXT,
    "optOutRequested" BOOLEAN NOT NULL DEFAULT false,
    "optOutAt" TIMESTAMP(3),
    "suppressedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_attempts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "recipientId" TEXT,
    "callId" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "terminationReason" TEXT,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "outcome" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbound_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_training_packs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'America/New_York',
    "identityJson" JSONB NOT NULL,
    "servicesJson" JSONB NOT NULL,
    "officeHoursJson" JSONB NOT NULL,
    "approvedAnswersJson" JSONB NOT NULL,
    "policiesJson" JSONB NOT NULL,
    "intakeJson" JSONB NOT NULL,
    "qualificationJson" JSONB NOT NULL,
    "appointmentJson" JSONB NOT NULL,
    "escalationJson" JSONB NOT NULL,
    "outboundJson" JSONB NOT NULL,
    "safetyJson" JSONB NOT NULL,
    "languagesJson" JSONB NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_training_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_observations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "callId" TEXT,
    "agentVersionId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "affectedCalls" INTEGER NOT NULL DEFAULT 1,
    "firstObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "proposalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_proposals" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "observationIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proposalType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "expectedBenefit" TEXT NOT NULL,
    "risk" TEXT,
    "changedConfig" JSONB NOT NULL,
    "evaluationRequirements" JSONB,
    "reviewerId" TEXT,
    "decision" TEXT,
    "decisionAt" TIMESTAMP(3),
    "deploymentCandidateId" TEXT,
    "rollbackPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_suites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "businessId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "agentVersionId" TEXT,
    "channel" TEXT NOT NULL,
    "workflow" TEXT,
    "cases" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_suites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_runs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "suiteId" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "evaluatorType" TEXT NOT NULL,
    "evaluatorVersion" TEXT NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "inputReferences" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "evidence" JSONB,
    "confidence" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_candidates" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentVersionId" TEXT,
    "proposalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "evaluationSuiteIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canaryResults" JSONB,
    "regressionDetected" BOOLEAN NOT NULL DEFAULT false,
    "rollbackRecordId" TEXT,
    "deployedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployment_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_deployments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "deploymentCandidateId" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'PRODUCTION',
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rollbackReason" TEXT,

    CONSTRAINT "agent_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rollback_records" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "deploymentCandidateId" TEXT,
    "agentDeploymentId" TEXT,
    "rollbackReason" TEXT NOT NULL,
    "rolledBackAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rollbackPerformedBy" TEXT,

    CONSTRAINT "rollback_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailEncrypted" TEXT,
    "phoneEncrypted" TEXT,
    "phoneHash" TEXT,
    "phoneMasked" TEXT,
    "phoneLast4" TEXT,
    "company" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en-US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "conversation_tool_executions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "actionId" TEXT,
    "operationFingerprint" TEXT,
    "payloadFingerprint" TEXT,
    "safeInput" JSONB,
    "safeResult" JSONB,
    "status" "ConversationToolStatus" NOT NULL DEFAULT 'REQUESTED',
    "policyOutcome" "ToolPolicyOutcome",
    "policyVersion" TEXT,
    "riskLevel" TEXT,
    "riskScore" INTEGER,
    "triggeredPolicyIds" JSONB,
    "decisionReasonCodes" JSONB,
    "latencyMs" INTEGER,
    "errorCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_tool_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_approval_requests" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "toolExecutionId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "payloadFingerprint" TEXT NOT NULL,
    "status" "ToolApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "policyVersion" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "triggeredPolicyIds" JSONB,
    "reasonCodes" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "decidedAt" TIMESTAMP(3),
    "decidedByUserId" TEXT,
    "decisionComment" TEXT,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_provider_correlations" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_provider_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "provider_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "provider" "ProviderType" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerCallControlId" TEXT,
    "providerCallSessionId" TEXT,
    "providerCallLegId" TEXT,
    "connectionId" TEXT,
    "processingState" TEXT NOT NULL DEFAULT 'PENDING',
    "safePayload" JSONB NOT NULL,
    "encryptedPayload" TEXT,
    "processedAt" TIMESTAMP(3),
    "errorCategory" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "type" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorCategory" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handoffs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "callId" TEXT,
    "agentId" TEXT,
    "reason" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "transferStartedAt" TIMESTAMP(3),
    "transferEndedAt" TIMESTAMP(3),
    "result" TEXT,
    "finalOwner" TEXT,
    "briefText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "callId" TEXT,
    "contactId" TEXT,
    "campaignId" TEXT,
    "followUpType" TEXT NOT NULL,
    "preferredTime" TIMESTAMP(3),
    "preferredChannel" TEXT NOT NULL DEFAULT 'PHONE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "previousData" JSONB,
    "newData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");

-- CreateIndex
CREATE INDEX "workspace_members_workspaceId_idx" ON "workspace_members"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_tokenHash_key" ON "invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "invitations_workspaceId_idx" ON "invitations"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_workspaceId_key" ON "business_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "voice_agents_workspaceId_idx" ON "voice_agents"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_versions_agentId_versionNumber_key" ON "agent_versions"("agentId", "versionNumber");

-- CreateIndex
CREATE INDEX "phone_numbers_workspaceId_idx" ON "phone_numbers"("workspaceId");

-- CreateIndex
CREATE INDEX "phone_numbers_workspaceId_businessId_status_idx" ON "phone_numbers"("workspaceId", "businessId", "status");

-- CreateIndex
CREATE INDEX "phone_numbers_workspaceId_voiceProviderPhoneNumberId_idx" ON "phone_numbers"("workspaceId", "voiceProviderPhoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_provider_providerId_key" ON "phone_numbers"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_provider_numberHash_key" ON "phone_numbers"("provider", "numberHash");

-- CreateIndex
CREATE INDEX "provider_connections_workspaceId_idx" ON "provider_connections"("workspaceId");

-- CreateIndex
CREATE INDEX "knowledge_items_workspaceId_idx" ON "knowledge_items"("workspaceId");

-- CreateIndex
CREATE INDEX "knowledge_items_workspaceId_status_language_idx" ON "knowledge_items"("workspaceId", "status", "language");

-- CreateIndex
CREATE INDEX "knowledge_items_workspaceId_category_idx" ON "knowledge_items"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "qualification_rules_workspaceId_idx" ON "qualification_rules"("workspaceId");

-- CreateIndex
CREATE INDEX "escalation_policies_workspaceId_idx" ON "escalation_policies"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "calls_appointmentId_key" ON "calls"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "calls_leadId_key" ON "calls"("leadId");

-- CreateIndex
CREATE INDEX "calls_workspaceId_idx" ON "calls"("workspaceId");

-- CreateIndex
CREATE INDEX "calls_workspaceId_status_idx" ON "calls"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "calls_workspaceId_createdAt_idx" ON "calls"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "calls_executionMode_createdAt_idx" ON "calls"("executionMode", "createdAt");

-- CreateIndex
CREATE INDEX "call_legs_callId_idx" ON "call_legs"("callId");

-- CreateIndex
CREATE INDEX "call_participants_callId_idx" ON "call_participants"("callId");

-- CreateIndex
CREATE INDEX "call_tool_executions_callId_idx" ON "call_tool_executions"("callId");

-- CreateIndex
CREATE INDEX "call_recordings_callId_idx" ON "call_recordings"("callId");

-- CreateIndex
CREATE INDEX "call_evaluations_callId_idx" ON "call_evaluations"("callId");

-- CreateIndex
CREATE INDEX "call_events_callId_idx" ON "call_events"("callId");

-- CreateIndex
CREATE INDEX "call_events_providerEventId_idx" ON "call_events"("providerEventId");

-- CreateIndex
CREATE INDEX "call_events_processingStatus_idx" ON "call_events"("processingStatus");

-- CreateIndex
CREATE INDEX "transcript_segments_callId_idx" ON "transcript_segments"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "call_summaries_callId_key" ON "call_summaries"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_callId_key" ON "leads"("callId");

-- CreateIndex
CREATE INDEX "leads_workspaceId_idx" ON "leads"("workspaceId");

-- CreateIndex
CREATE INDEX "leads_workspaceId_category_idx" ON "leads"("workspaceId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_sourceConversationId_key" ON "opportunities"("sourceConversationId");

-- CreateIndex
CREATE INDEX "opportunities_workspaceId_stage_updatedAt_idx" ON "opportunities"("workspaceId", "stage", "updatedAt");

-- CreateIndex
CREATE INDEX "opportunities_workspaceId_contactId_updatedAt_idx" ON "opportunities"("workspaceId", "contactId", "updatedAt");

-- CreateIndex
CREATE INDEX "opportunities_ownerId_stage_idx" ON "opportunities"("ownerId", "stage");

-- CreateIndex
CREATE INDEX "calendar_connections_workspaceId_idx" ON "calendar_connections"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_callId_key" ON "appointments"("callId");

-- CreateIndex
CREATE INDEX "appointments_workspaceId_idx" ON "appointments"("workspaceId");

-- CreateIndex
CREATE INDEX "appointments_workspaceId_startTime_idx" ON "appointments"("workspaceId", "startTime");

-- CreateIndex
CREATE INDEX "appointments_workspaceId_contactId_startTime_idx" ON "appointments"("workspaceId", "contactId", "startTime");

-- CreateIndex
CREATE INDEX "appointments_conversationId_idx" ON "appointments"("conversationId");

-- CreateIndex
CREATE INDEX "crm_connections_workspaceId_idx" ON "crm_connections"("workspaceId");

-- CreateIndex
CREATE INDEX "crm_activities_workspaceId_idx" ON "crm_activities"("workspaceId");

-- CreateIndex
CREATE INDEX "notifications_workspaceId_idx" ON "notifications"("workspaceId");

-- CreateIndex
CREATE INDEX "webhook_endpoints_workspaceId_idx" ON "webhook_endpoints"("workspaceId");

-- CreateIndex
CREATE INDEX "webhook_deliveries_webhookEndpointId_idx" ON "webhook_deliveries"("webhookEndpointId");

-- CreateIndex
CREATE INDEX "language_profiles_workspaceId_idx" ON "language_profiles"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "language_profiles_workspaceId_languageCode_key" ON "language_profiles"("workspaceId", "languageCode");

-- CreateIndex
CREATE INDEX "sip_trunks_workspaceId_idx" ON "sip_trunks"("workspaceId");

-- CreateIndex
CREATE INDEX "telephony_connections_workspaceId_idx" ON "telephony_connections"("workspaceId");

-- CreateIndex
CREATE INDEX "call_concurrency_leases_scopeType_scopeId_idx" ON "call_concurrency_leases"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "call_concurrency_leases_status_idx" ON "call_concurrency_leases"("status");

-- CreateIndex
CREATE INDEX "consent_records_workspaceId_idx" ON "consent_records"("workspaceId");

-- CreateIndex
CREATE INDEX "consent_records_contactId_idx" ON "consent_records"("contactId");

-- CreateIndex
CREATE INDEX "suppression_entries_workspaceId_phoneHash_idx" ON "suppression_entries"("workspaceId", "phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "communication_preferences_contactId_key" ON "communication_preferences"("contactId");

-- CreateIndex
CREATE INDEX "communication_preferences_workspaceId_contactId_idx" ON "communication_preferences"("workspaceId", "contactId");

-- CreateIndex
CREATE INDEX "campaigns_workspaceId_idx" ON "campaigns"("workspaceId");

-- CreateIndex
CREATE INDEX "campaigns_workspaceId_state_idx" ON "campaigns"("workspaceId", "state");

-- CreateIndex
CREATE INDEX "campaign_recipients_campaignId_status_idx" ON "campaign_recipients"("campaignId", "status");

-- CreateIndex
CREATE INDEX "outbound_attempts_workspaceId_idx" ON "outbound_attempts"("workspaceId");

-- CreateIndex
CREATE INDEX "outbound_attempts_campaignId_idx" ON "outbound_attempts"("campaignId");

-- CreateIndex
CREATE INDEX "business_training_packs_workspaceId_idx" ON "business_training_packs"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "business_training_packs_workspaceId_agentId_versionNumber_key" ON "business_training_packs"("workspaceId", "agentId", "versionNumber");

-- CreateIndex
CREATE INDEX "improvement_observations_workspaceId_idx" ON "improvement_observations"("workspaceId");

-- CreateIndex
CREATE INDEX "improvement_observations_category_idx" ON "improvement_observations"("category");

-- CreateIndex
CREATE INDEX "improvement_proposals_workspaceId_idx" ON "improvement_proposals"("workspaceId");

-- CreateIndex
CREATE INDEX "improvement_proposals_status_idx" ON "improvement_proposals"("status");

-- CreateIndex
CREATE INDEX "evaluation_suites_workspaceId_idx" ON "evaluation_suites"("workspaceId");

-- CreateIndex
CREATE INDEX "evaluation_runs_workspaceId_idx" ON "evaluation_runs"("workspaceId");

-- CreateIndex
CREATE INDEX "deployment_candidates_workspaceId_idx" ON "deployment_candidates"("workspaceId");

-- CreateIndex
CREATE INDEX "agent_deployments_workspaceId_idx" ON "agent_deployments"("workspaceId");

-- CreateIndex
CREATE INDEX "rollback_records_workspaceId_idx" ON "rollback_records"("workspaceId");

-- CreateIndex
CREATE INDEX "contacts_workspaceId_idx" ON "contacts"("workspaceId");

-- CreateIndex
CREATE INDEX "contacts_workspaceId_phoneHash_idx" ON "contacts"("workspaceId", "phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_callId_key" ON "conversations"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_correlationId_key" ON "conversations"("correlationId");

-- CreateIndex
CREATE INDEX "conversations_workspaceId_status_startedAt_idx" ON "conversations"("workspaceId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_workspaceId_contactId_startedAt_idx" ON "conversations"("workspaceId", "contactId", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_workspaceId_channel_direction_startedAt_idx" ON "conversations"("workspaceId", "channel", "direction", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_businessId_startedAt_idx" ON "conversations"("businessId", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_agentId_startedAt_idx" ON "conversations"("agentId", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_campaignId_startedAt_idx" ON "conversations"("campaignId", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_providerConversationId_idx" ON "conversations"("providerConversationId");

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_messages_providerEventId_idx" ON "conversation_messages"("providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_messages_conversationId_sequence_key" ON "conversation_messages"("conversationId", "sequence");

-- CreateIndex
CREATE INDEX "conversation_fields_conversationId_fieldKey_createdAt_idx" ON "conversation_fields"("conversationId", "fieldKey", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_tool_executions_conversationId_createdAt_idx" ON "conversation_tool_executions"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_tool_executions_conversationId_status_idx" ON "conversation_tool_executions"("conversationId", "status");

-- CreateIndex
CREATE INDEX "conversation_tool_executions_conversationId_tool_payloadFin_idx" ON "conversation_tool_executions"("conversationId", "tool", "payloadFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_tool_executions_conversationId_actionId_key" ON "conversation_tool_executions"("conversationId", "actionId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_tool_executions_conversationId_operationFinger_key" ON "conversation_tool_executions"("conversationId", "operationFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "tool_approval_requests_toolExecutionId_key" ON "tool_approval_requests"("toolExecutionId");

-- CreateIndex
CREATE INDEX "tool_approval_requests_workspaceId_status_createdAt_idx" ON "tool_approval_requests"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "tool_approval_requests_conversationId_status_idx" ON "tool_approval_requests"("conversationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tool_approval_requests_conversationId_actionId_key" ON "tool_approval_requests"("conversationId", "actionId");

-- CreateIndex
CREATE INDEX "conversation_provider_correlations_conversationId_idx" ON "conversation_provider_correlations"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_provider_correlations_provider_identifierType__key" ON "conversation_provider_correlations"("provider", "identifierType", "identifierValue");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_states_conversationId_key" ON "conversation_states"("conversationId");

-- CreateIndex
CREATE INDEX "provider_events_processingState_receivedAt_idx" ON "provider_events"("processingState", "receivedAt");

-- CreateIndex
CREATE INDEX "provider_events_provider_providerCallControlId_idx" ON "provider_events"("provider", "providerCallControlId");

-- CreateIndex
CREATE INDEX "provider_events_correlationId_idx" ON "provider_events"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_events_provider_providerEventId_key" ON "provider_events"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "background_jobs_status_availableAt_idx" ON "background_jobs"("status", "availableAt");

-- CreateIndex
CREATE INDEX "background_jobs_workspaceId_status_idx" ON "background_jobs"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "background_jobs_correlationId_idx" ON "background_jobs"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "background_jobs_type_resourceId_key" ON "background_jobs"("type", "resourceId");

-- CreateIndex
CREATE INDEX "tasks_workspaceId_idx" ON "tasks"("workspaceId");

-- CreateIndex
CREATE INDEX "handoffs_workspaceId_idx" ON "handoffs"("workspaceId");

-- CreateIndex
CREATE INDEX "follow_ups_workspaceId_idx" ON "follow_ups"("workspaceId");

-- CreateIndex
CREATE INDEX "audit_logs_workspaceId_idx" ON "audit_logs"("workspaceId");

-- CreateIndex
CREATE INDEX "audit_logs_workspaceId_createdAt_idx" ON "audit_logs"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_calendarConnectionId_fkey" FOREIGN KEY ("calendarConnectionId") REFERENCES "calendar_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_crmConnectionId_fkey" FOREIGN KEY ("crmConnectionId") REFERENCES "crm_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_qualificationRuleId_fkey" FOREIGN KEY ("qualificationRuleId") REFERENCES "qualification_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_escalationPolicyId_fkey" FOREIGN KEY ("escalationPolicyId") REFERENCES "escalation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_versions" ADD CONSTRAINT "agent_versions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "voice_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "voice_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_languageProfileId_fkey" FOREIGN KEY ("languageProfileId") REFERENCES "language_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_trainingPackVersionId_fkey" FOREIGN KEY ("trainingPackVersionId") REFERENCES "business_training_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_connections" ADD CONSTRAINT "provider_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualification_rules" ADD CONSTRAINT "qualification_rules_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_policies" ADD CONSTRAINT "escalation_policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "voice_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_legs" ADD CONSTRAINT "call_legs_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_tool_executions" ADD CONSTRAINT "call_tool_executions_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_evaluations" ADD CONSTRAINT "call_evaluations_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_summaries" ADD CONSTRAINT "call_summaries_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_sourceConversationId_fkey" FOREIGN KEY ("sourceConversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_calendarConnectionId_fkey" FOREIGN KEY ("calendarConnectionId") REFERENCES "calendar_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_connections" ADD CONSTRAINT "crm_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_crmConnectionId_fkey" FOREIGN KEY ("crmConnectionId") REFERENCES "crm_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhookEndpointId_fkey" FOREIGN KEY ("webhookEndpointId") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language_profiles" ADD CONSTRAINT "language_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sip_trunks" ADD CONSTRAINT "sip_trunks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telephony_connections" ADD CONSTRAINT "telephony_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_concurrency_leases" ADD CONSTRAINT "call_concurrency_leases_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppression_entries" ADD CONSTRAINT "suppression_entries_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppression_entries" ADD CONSTRAINT "suppression_entries_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_preferences" ADD CONSTRAINT "communication_preferences_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_preferences" ADD CONSTRAINT "communication_preferences_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_attempts" ADD CONSTRAINT "outbound_attempts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_attempts" ADD CONSTRAINT "outbound_attempts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_attempts" ADD CONSTRAINT "outbound_attempts_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "campaign_recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_training_packs" ADD CONSTRAINT "business_training_packs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_observations" ADD CONSTRAINT "improvement_observations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_proposals" ADD CONSTRAINT "improvement_proposals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_suites" ADD CONSTRAINT "evaluation_suites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_candidates" ADD CONSTRAINT "deployment_candidates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_deployments" ADD CONSTRAINT "agent_deployments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rollback_records" ADD CONSTRAINT "rollback_records_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "voice_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "agent_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_trainingPackVersionId_fkey" FOREIGN KEY ("trainingPackVersionId") REFERENCES "business_training_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_languageProfileId_fkey" FOREIGN KEY ("languageProfileId") REFERENCES "language_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_fields" ADD CONSTRAINT "conversation_fields_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tool_executions" ADD CONSTRAINT "conversation_tool_executions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_approval_requests" ADD CONSTRAINT "tool_approval_requests_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_approval_requests" ADD CONSTRAINT "tool_approval_requests_toolExecutionId_fkey" FOREIGN KEY ("toolExecutionId") REFERENCES "conversation_tool_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_provider_correlations" ADD CONSTRAINT "conversation_provider_correlations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_events" ADD CONSTRAINT "provider_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Register the repository migration history after the schema has been initialized.
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('143535b637a4fe9283e0164004d6a9e1', 'fc4e7ae8477294746dcc767c0ce1b436cc6f013faea4247b01ed839220f62d04', CURRENT_TIMESTAMP, '20260809212000_add_canonical_conversations', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('dec5ca370cea647a76195026f96e4112', 'af21cb29eedb349cd15c605af8d2add81922e7f8ffb9be294ebbfa86bd0bec33', CURRENT_TIMESTAMP, '20260809213500_secure_phone_number_routing', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('d4f5c9b05f9f99110fb6a41a98fae5cb', 'c27994adcb9e05fd7575b568fe1cc97f8a88a3001b9a2718f8aabe2d45eda2f6', CURRENT_TIMESTAMP, '20260809215000_add_provider_event_inbox', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('b6a649e1d47172c3f3751b4b911ed6cb', 'f42c260f6bd8ab96cc8a626a091a9de99bb13a542438e6bdd5a4c15ec908816c', CURRENT_TIMESTAMP, '20260809220500_add_encrypted_provider_payload', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('b793217b1f8c0051d53072419374fc59', 'ab8be4c52def8c38b84b12c805077b51d4943e66af42fd0c8e1fdb853cd7f786', CURRENT_TIMESTAMP, '20260809233000_version_knowledge_items', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('0c32e97c64740d87e2c3a245e0dafc64', 'c35417cb374c1f0fc1b5b3c59e65413b95136ff1f6147a88ecd7ff4ac893ebb4', CURRENT_TIMESTAMP, '20260810130000_link_appointments_to_conversations', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('7abbf484f51c69ed35e1d87304835ce4', 'bd67db6f8034c773b2f5dcc961749da658491f2cfb8d990e2efce73bd6f5b162', CURRENT_TIMESTAMP, '20260810133000_add_qualified_opportunities', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('08cdfb9261b1570c01132b82f110bc78', 'befa844e5ceb15195c52afe38bc0acc3684244b0327fe098dbd334c7d9b7e5ce', CURRENT_TIMESTAMP, '20260810140000_harden_language_readiness', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('f58baa4d4f353bd2908e5bf2450213c2', '0036e6dfb4bf2a6cf6bc8e27e050743da67dc4ee0554835db2e078ee786ba2a1', CURRENT_TIMESTAMP, '20260810150000_protect_contact_phone_display', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('7920527d3b493de9d931db37410211fd', '58c8f30314dc9463c13af8e1e5e05d9c29d0a9335079c824bee71af3060a362c', CURRENT_TIMESTAMP, '20260810160000_add_campaign_supported_countries', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('05bff45a34f75186926647e3a6991322', 'c0ad7f4df28828eb91e85d8989f424da9c48f75bd70e88ba7ca37e6878193fe5', CURRENT_TIMESTAMP, '20260810190000_add_voice_provider_phone_mapping', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('8831f571d312b281cca72066c0d80a7f', 'cfcd5ac12ef0614e7125873a1069245820eec9a6df2defa2144fc50e3dec22ae', CURRENT_TIMESTAMP, '20260810200000_add_supervised_improvement_lifecycle', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('ea7b7221d8457593784646f58599f658', '45976703753d548c43601ee185f5efa274659a27a83a6df43deeb6a8cbc490f8', CURRENT_TIMESTAMP, '20260812090000_add_telephony_simulation_mode', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES ('18056a22bbe71a761ef956846957da6f', '9b34df63e5bef5bd08477c8f6904ec9e3ab808d8ba3057318b9feb84b04f3d35', CURRENT_TIMESTAMP, '20260812223000_add_tool_governance', NULL, NULL, CURRENT_TIMESTAMP, 1) ON CONFLICT ("id") DO NOTHING;
