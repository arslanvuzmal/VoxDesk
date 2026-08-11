-- Supervised improvement persistence.
-- All production mutation remains behind explicit human review and deployment gates.

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

CREATE INDEX "improvement_observations_workspaceId_idx" ON "improvement_observations"("workspaceId");
CREATE INDEX "improvement_observations_category_idx" ON "improvement_observations"("category");
CREATE INDEX "improvement_proposals_workspaceId_idx" ON "improvement_proposals"("workspaceId");
CREATE INDEX "improvement_proposals_status_idx" ON "improvement_proposals"("status");
CREATE INDEX "evaluation_suites_workspaceId_idx" ON "evaluation_suites"("workspaceId");
CREATE INDEX "evaluation_runs_workspaceId_idx" ON "evaluation_runs"("workspaceId");
CREATE INDEX "deployment_candidates_workspaceId_idx" ON "deployment_candidates"("workspaceId");
CREATE INDEX "agent_deployments_workspaceId_idx" ON "agent_deployments"("workspaceId");
CREATE UNIQUE INDEX "agent_deployments_one_active_environment"
  ON "agent_deployments"("workspaceId", "agentId", "environment")
  WHERE "active" = true;
CREATE INDEX "rollback_records_workspaceId_idx" ON "rollback_records"("workspaceId");

ALTER TABLE "improvement_observations"
  ADD CONSTRAINT "improvement_observations_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "improvement_proposals"
  ADD CONSTRAINT "improvement_proposals_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluation_suites"
  ADD CONSTRAINT "evaluation_suites_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluation_runs"
  ADD CONSTRAINT "evaluation_runs_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deployment_candidates"
  ADD CONSTRAINT "deployment_candidates_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_deployments"
  ADD CONSTRAINT "agent_deployments_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rollback_records"
  ADD CONSTRAINT "rollback_records_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
