/*
  Warnings:

  - A unique constraint covering the columns `[id,organizationId]` on the table `template_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubmissionReviewDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "templateVersionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_attempts" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "submissionId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "clientAttemptId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_reviews" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "attemptId" UUID NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "decision" "SubmissionReviewDecision" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_organizationId_createdAt_idx" ON "submissions"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_id_organizationId_key" ON "submissions"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_organizationId_taskId_key" ON "submissions"("organizationId", "taskId");

-- CreateIndex
CREATE INDEX "submission_attempts_organizationId_submittedAt_idx" ON "submission_attempts"("organizationId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "submission_attempts_id_organizationId_key" ON "submission_attempts"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_attempts_submissionId_attemptNumber_key" ON "submission_attempts"("submissionId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "submission_attempts_organizationId_clientAttemptId_key" ON "submission_attempts"("organizationId", "clientAttemptId");

-- CreateIndex
CREATE INDEX "submission_reviews_organizationId_reviewedAt_idx" ON "submission_reviews"("organizationId", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "submission_reviews_attemptId_organizationId_key" ON "submission_reviews"("attemptId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_id_organizationId_key" ON "template_versions"("id", "organizationId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_templateVersionId_organizationId_fkey" FOREIGN KEY ("templateVersionId", "organizationId") REFERENCES "template_versions"("id", "organizationId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "submission_attempts" ADD CONSTRAINT "submission_attempts_submissionId_organizationId_fkey" FOREIGN KEY ("submissionId", "organizationId") REFERENCES "submissions"("id", "organizationId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "submission_reviews" ADD CONSTRAINT "submission_reviews_attemptId_organizationId_fkey" FOREIGN KEY ("attemptId", "organizationId") REFERENCES "submission_attempts"("id", "organizationId") ON DELETE RESTRICT ON UPDATE RESTRICT;
