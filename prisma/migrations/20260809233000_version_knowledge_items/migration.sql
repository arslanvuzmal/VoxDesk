ALTER TABLE "knowledge_items"
  ADD COLUMN "title" TEXT,
  ADD COLUMN "content" TEXT,
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "effectiveFrom" TIMESTAMP(3),
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "source" TEXT,
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE INDEX "knowledge_items_workspaceId_status_language_idx"
  ON "knowledge_items"("workspaceId", "status", "language");

CREATE INDEX "knowledge_items_workspaceId_category_idx"
  ON "knowledge_items"("workspaceId", "category");
