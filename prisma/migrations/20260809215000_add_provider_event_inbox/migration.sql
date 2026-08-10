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
    "processedAt" TIMESTAMP(3),
    "errorCategory" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "provider_events_pkey" PRIMARY KEY ("id")
);

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

CREATE UNIQUE INDEX "provider_events_provider_providerEventId_key" ON "provider_events"("provider", "providerEventId");
CREATE INDEX "provider_events_processingState_receivedAt_idx" ON "provider_events"("processingState", "receivedAt");
CREATE INDEX "provider_events_provider_providerCallControlId_idx" ON "provider_events"("provider", "providerCallControlId");
CREATE INDEX "provider_events_correlationId_idx" ON "provider_events"("correlationId");
CREATE UNIQUE INDEX "background_jobs_type_resourceId_key" ON "background_jobs"("type", "resourceId");
CREATE INDEX "background_jobs_status_availableAt_idx" ON "background_jobs"("status", "availableAt");
CREATE INDEX "background_jobs_workspaceId_status_idx" ON "background_jobs"("workspaceId", "status");
CREATE INDEX "background_jobs_correlationId_idx" ON "background_jobs"("correlationId");

ALTER TABLE "provider_events" ADD CONSTRAINT "provider_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
