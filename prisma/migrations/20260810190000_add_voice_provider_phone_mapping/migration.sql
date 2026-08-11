-- Additive mapping for the phone number imported into the canonical realtime voice provider.
-- This identifier is server-only and is never accepted from browser requests.
ALTER TABLE "phone_numbers"
  ADD COLUMN "voiceProviderPhoneNumberId" TEXT;

CREATE INDEX "phone_numbers_workspaceId_voiceProviderPhoneNumberId_idx"
  ON "phone_numbers"("workspaceId", "voiceProviderPhoneNumberId");
