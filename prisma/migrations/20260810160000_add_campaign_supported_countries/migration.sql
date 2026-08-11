ALTER TABLE "campaigns"
ADD COLUMN "supportedCountries" JSONB NOT NULL DEFAULT '[]'::jsonb;
