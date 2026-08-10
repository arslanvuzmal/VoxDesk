-- REVIEW-ONLY EXPAND/ALTER PLAN.
-- The repository had no Prisma migration history at the start of this phase.
-- Establish/baseline the target database migration history before promoting this SQL.

CREATE TYPE "RecordingConsentState" AS ENUM (
  'NOT_REQUESTED',
  'DISCLOSURE_REQUIRED',
  'CONSENT_REQUESTED',
  'CONSENT_GRANTED',
  'CONSENT_DECLINED',
  'RECORDING_DISABLED'
);

ALTER TABLE "calls"
  ALTER COLUMN "recordingConsent" SET DEFAULT false,
  ALTER COLUMN "outcome" DROP DEFAULT,
  ALTER COLUMN "outcome" DROP NOT NULL,
  ADD COLUMN "recordingConsentState" "RecordingConsentState" NOT NULL DEFAULT 'NOT_REQUESTED';

ALTER TABLE "consent_records"
  ALTER COLUMN "consentStatus" SET DEFAULT 'NOT_RECORDED',
  ALTER COLUMN "grantedAt" DROP DEFAULT,
  ALTER COLUMN "grantedAt" DROP NOT NULL;

