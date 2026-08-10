ALTER TABLE "contacts"
ADD COLUMN "phoneMasked" TEXT,
ADD COLUMN "phoneLast4" TEXT;

CREATE INDEX "contacts_workspaceId_phoneHash_idx"
ON "contacts"("workspaceId", "phoneHash");

