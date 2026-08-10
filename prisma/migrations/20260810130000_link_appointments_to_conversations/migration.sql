ALTER TABLE "appointments"
ADD COLUMN "contactId" TEXT,
ADD COLUMN "conversationId" TEXT;

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "appointments_workspaceId_contactId_startTime_idx"
ON "appointments"("workspaceId", "contactId", "startTime");

CREATE INDEX "appointments_conversationId_idx"
ON "appointments"("conversationId");
