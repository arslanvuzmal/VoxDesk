CREATE TYPE "OpportunityStage" AS ENUM ('QUALIFIED', 'DISCOVERY', 'PROPOSAL', 'WON', 'LOST');

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

CREATE UNIQUE INDEX "opportunities_sourceConversationId_key"
ON "opportunities"("sourceConversationId");

CREATE INDEX "opportunities_workspaceId_stage_updatedAt_idx"
ON "opportunities"("workspaceId", "stage", "updatedAt");

CREATE INDEX "opportunities_workspaceId_contactId_updatedAt_idx"
ON "opportunities"("workspaceId", "contactId", "updatedAt");

CREATE INDEX "opportunities_ownerId_stage_idx"
ON "opportunities"("ownerId", "stage");

ALTER TABLE "opportunities"
ADD CONSTRAINT "opportunities_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "opportunities"
ADD CONSTRAINT "opportunities_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "opportunities"
ADD CONSTRAINT "opportunities_sourceConversationId_fkey"
FOREIGN KEY ("sourceConversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
