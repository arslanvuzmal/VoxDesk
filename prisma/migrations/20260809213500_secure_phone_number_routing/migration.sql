-- Add secure, explicit inbound routing identifiers. Existing masked-only numbers remain
-- unroutable until an administrator re-verifies the full number and provider identifier.
ALTER TABLE "phone_numbers"
  ADD COLUMN "businessId" TEXT,
  ADD COLUMN "languageProfileId" TEXT,
  ADD COLUMN "trainingPackVersionId" TEXT,
  ADD COLUMN "numberEncrypted" TEXT,
  ADD COLUMN "numberHash" TEXT,
  ADD COLUMN "numberLast4" TEXT;

CREATE UNIQUE INDEX "phone_numbers_provider_providerId_key" ON "phone_numbers"("provider", "providerId");
CREATE UNIQUE INDEX "phone_numbers_provider_numberHash_key" ON "phone_numbers"("provider", "numberHash");
CREATE INDEX "phone_numbers_workspaceId_businessId_status_idx" ON "phone_numbers"("workspaceId", "businessId", "status");

ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_languageProfileId_fkey" FOREIGN KEY ("languageProfileId") REFERENCES "language_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_trainingPackVersionId_fkey" FOREIGN KEY ("trainingPackVersionId") REFERENCES "business_training_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
