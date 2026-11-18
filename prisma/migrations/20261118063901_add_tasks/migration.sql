-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETE');

-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('WORKER', 'STATIONED_PHONE');

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "number" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "warehouse" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "templateVersionId" UUID NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assigneeType" "AssigneeType",
    "assigneeId" TEXT,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_number_key" ON "tasks"("number");

-- CreateIndex
CREATE INDEX "tasks_organizationId_status_idx" ON "tasks"("organizationId", "status");

-- CreateIndex
CREATE INDEX "tasks_organizationId_updatedAt_idx" ON "tasks"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "tasks_organizationId_assigneeId_idx" ON "tasks"("organizationId", "assigneeId");

-- CreateIndex
CREATE INDEX "tasks_templateVersionId_idx" ON "tasks"("templateVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_id_organizationId_key" ON "tasks"("id", "organizationId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "template_versions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
