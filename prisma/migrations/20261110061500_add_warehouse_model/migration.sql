-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT DEFAULT '',
    "supervisor" TEXT NOT NULL DEFAULT 'Unassigned',
    "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warehouses_organizationId_status_idx" ON "warehouses"("organizationId", "status");

-- CreateIndex
CREATE INDEX "warehouses_organizationId_updatedAt_idx" ON "warehouses"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_id_organizationId_key" ON "warehouses"("id", "organizationId");
