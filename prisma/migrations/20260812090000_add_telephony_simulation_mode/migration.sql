-- Distinguish deterministic portfolio simulations from carrier-backed calls.
-- Existing records remain LIVE because their execution source predates this marker.
CREATE TYPE "CallExecutionMode" AS ENUM ('SIMULATION', 'LIVE');

ALTER TYPE "ProviderType" ADD VALUE IF NOT EXISTS 'SIMULATION';

ALTER TABLE "calls"
  ADD COLUMN "executionMode" "CallExecutionMode" NOT NULL DEFAULT 'LIVE',
  ADD COLUMN "simulationScenario" TEXT,
  ADD COLUMN "simulationVersion" TEXT;

CREATE INDEX "calls_executionMode_createdAt_idx" ON "calls"("executionMode", "createdAt");
