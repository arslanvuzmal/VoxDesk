-- Add durable, expiring demo sessions for deployments that use Postgres
-- without a separate Redis service.
CREATE TABLE "demo_sessions" (
    "id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "presetKey" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'READY',
    "data" JSONB NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgentHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lockExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "demo_stored_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_stored_responses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "demo_sessions_completed_expiresAt_idx"
    ON "demo_sessions"("completed", "expiresAt");

CREATE INDEX "demo_sessions_ipHash_createdAt_idx"
    ON "demo_sessions"("ipHash", "createdAt");

CREATE INDEX "demo_stored_responses_sessionId_createdAt_idx"
    ON "demo_stored_responses"("sessionId", "createdAt");

CREATE INDEX "demo_stored_responses_consumed_expiresAt_idx"
    ON "demo_stored_responses"("consumed", "expiresAt");

ALTER TABLE "demo_stored_responses"
    ADD CONSTRAINT "demo_stored_responses_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "demo_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
