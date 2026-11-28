-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "assignedWork" TEXT NOT NULL DEFAULT '0 tasks',
    "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_id_organizationId_key" ON "locations"("id", "organizationId");

-- CreateIndex
CREATE INDEX "locations_warehouseId_status_idx" ON "locations"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "locations_organizationId_warehouseId_idx" ON "locations"("organizationId", "warehouseId");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_organizationId_fkey" FOREIGN KEY ("warehouseId", "organizationId") REFERENCES "warehouses"("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;
