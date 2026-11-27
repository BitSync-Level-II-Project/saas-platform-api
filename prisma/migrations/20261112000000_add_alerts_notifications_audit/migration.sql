-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RuleOperator" AS ENUM ('GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'BETWEEN');

-- CreateEnum
CREATE TYPE "NotifyTarget" AS ENUM ('SUPERVISOR', 'SUPERVISOR_MANAGER');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('FIELD_SUBMISSION', 'STATIONED_TELEMETRY', 'HEARTBEAT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "siteId" UUID,
    "locationId" TEXT,
    "templateId" UUID,
    "fieldKey" TEXT NOT NULL,
    "operator" "RuleOperator" NOT NULL,
    "thresholdValue" DOUBLE PRECISION,
    "thresholdMax" DOUBLE PRECISION,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "notify" "NotifyTarget" NOT NULL DEFAULT 'SUPERVISOR',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 15,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_events" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientEventId" TEXT NOT NULL,
    "sourceType" "EventSource" NOT NULL DEFAULT 'STATIONED_TELEMETRY',
    "deviceId" TEXT,
    "userId" TEXT,
    "siteId" UUID,
    "locationId" TEXT,
    "templateId" UUID,
    "payload" JSONB NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'RECEIVED',
    "error" TEXT,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operational_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'NEW',
    "ruleId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "siteId" UUID,
    "locationId" TEXT,
    "deviceId" TEXT,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_actions" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "alertId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL DEFAULT 'System',
    "actorRole" TEXT NOT NULL DEFAULT 'SYSTEM',
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" "Severity",
    "alertId" UUID,
    "status" "NotificationStatus" NOT NULL DEFAULT 'DELIVERED',
    "failureReason" TEXT,
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minSeverity" "Severity" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL DEFAULT 'System',
    "actorRole" TEXT NOT NULL DEFAULT 'SYSTEM',
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "outcome" "AuditOutcome" NOT NULL DEFAULT 'SUCCESS',
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_rules_organizationId_enabled_idx" ON "automation_rules"("organizationId", "enabled");
CREATE INDEX "automation_rules_organizationId_siteId_idx" ON "automation_rules"("organizationId", "siteId");
CREATE INDEX "automation_rules_organizationId_updatedAt_idx" ON "automation_rules"("organizationId", "updatedAt");
CREATE UNIQUE INDEX "automation_rules_id_organizationId_key" ON "automation_rules"("id", "organizationId");

-- CreateIndex
CREATE INDEX "operational_events_organizationId_occurredAt_idx" ON "operational_events"("organizationId", "occurredAt");
CREATE INDEX "operational_events_organizationId_status_idx" ON "operational_events"("organizationId", "status");
CREATE UNIQUE INDEX "operational_events_organizationId_clientEventId_key" ON "operational_events"("organizationId", "clientEventId");

-- CreateIndex
CREATE INDEX "alerts_organizationId_status_idx" ON "alerts"("organizationId", "status");
CREATE INDEX "alerts_organizationId_severity_idx" ON "alerts"("organizationId", "severity");
CREATE INDEX "alerts_organizationId_createdAt_idx" ON "alerts"("organizationId", "createdAt");
CREATE UNIQUE INDEX "alerts_id_organizationId_key" ON "alerts"("id", "organizationId");

-- CreateIndex
CREATE INDEX "alert_actions_organizationId_alertId_idx" ON "alert_actions"("organizationId", "alertId");
CREATE INDEX "alert_actions_organizationId_createdAt_idx" ON "alert_actions"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_organizationId_recipientId_readAt_idx" ON "notifications"("organizationId", "recipientId", "readAt");
CREATE INDEX "notifications_organizationId_createdAt_idx" ON "notifications"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_organizationId_userId_key" ON "notification_preferences"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_action_idx" ON "audit_logs"("organizationId", "action");
CREATE INDEX "audit_logs_organizationId_resourceType_idx" ON "audit_logs"("organizationId", "resourceType");
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "operational_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_actions" ADD CONSTRAINT "alert_actions_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
