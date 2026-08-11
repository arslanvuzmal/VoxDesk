ALTER TABLE "language_profiles"
ADD COLUMN "disclosureContentComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pronunciationConfigured" BOOLEAN NOT NULL DEFAULT false;
