-- CreateTable
CREATE TABLE "templates" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "draftRevision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_versions" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "sourceDraftRevision" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB NOT NULL,
    "fields" JSONB NOT NULL,
    "publishedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_organizationId_updatedAt_idx" ON "templates"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "templates_id_organizationId_key" ON "templates"("id", "organizationId");

-- CreateIndex
CREATE INDEX "template_versions_organizationId_publishedAt_idx" ON "template_versions"("organizationId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_templateId_version_key" ON "template_versions"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_templateId_sourceDraftRevision_key" ON "template_versions"("templateId", "sourceDraftRevision");

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_templateId_organizationId_fkey" FOREIGN KEY ("templateId", "organizationId") REFERENCES "templates"("id", "organizationId") ON DELETE RESTRICT ON UPDATE RESTRICT;
