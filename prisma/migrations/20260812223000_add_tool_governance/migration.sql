-- Add deterministic tri-state tool policy evidence and human approval binding.
-- The migration is additive; existing tool executions remain valid and require no backfill.

ALTER TYPE "ConversationToolStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';

CREATE TYPE "ToolPolicyOutcome" AS ENUM ('ALLOW', 'DENY', 'ESCALATE');
CREATE TYPE "ToolApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CONSUMED');

ALTER TABLE "conversation_tool_executions"
  ADD COLUMN "actionId" TEXT,
  ADD COLUMN "payloadFingerprint" TEXT,
  ADD COLUMN "policyOutcome" "ToolPolicyOutcome",
  ADD COLUMN "policyVersion" TEXT,
  ADD COLUMN "riskLevel" TEXT,
  ADD COLUMN "riskScore" INTEGER,
  ADD COLUMN "triggeredPolicyIds" JSONB,
  ADD COLUMN "decisionReasonCodes" JSONB;

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

CREATE UNIQUE INDEX "conversation_tool_executions_conversationId_actionId_key"
  ON "conversation_tool_executions"("conversationId", "actionId");
CREATE INDEX "conversation_tool_executions_conversationId_tool_payloadFingerprint_idx"
  ON "conversation_tool_executions"("conversationId", "tool", "payloadFingerprint");

CREATE UNIQUE INDEX "tool_approval_requests_toolExecutionId_key"
  ON "tool_approval_requests"("toolExecutionId");
CREATE UNIQUE INDEX "tool_approval_requests_conversationId_actionId_key"
  ON "tool_approval_requests"("conversationId", "actionId");
CREATE INDEX "tool_approval_requests_workspaceId_status_createdAt_idx"
  ON "tool_approval_requests"("workspaceId", "status", "createdAt");
CREATE INDEX "tool_approval_requests_conversationId_status_idx"
  ON "tool_approval_requests"("conversationId", "status");

ALTER TABLE "tool_approval_requests"
  ADD CONSTRAINT "tool_approval_requests_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "conversations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tool_approval_requests"
  ADD CONSTRAINT "tool_approval_requests_toolExecutionId_fkey"
  FOREIGN KEY ("toolExecutionId") REFERENCES "conversation_tool_executions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
