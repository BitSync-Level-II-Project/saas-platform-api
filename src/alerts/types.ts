export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';
export type Operator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'BETWEEN';
export type NotifStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
export type Role = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'WORKER';
export type AlertActionName = 'acknowledge' | 'resolve' | 'escalate';
export type Notify = 'SUPERVISOR' | 'SUPERVISOR_MANAGER';
export type EventSource = 'FIELD_SUBMISSION' | 'STATIONED_TELEMETRY' | 'HEARTBEAT';
export type EventStatus = 'RECEIVED' | 'PROCESSED' | 'FAILED';
export type AuditOutcome = 'SUCCESS' | 'FAILURE';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TenantContext {
  organizationId: string;
  userId: string;
  userName: string;
  userRole: Role;
}

export const OPERATOR_SYMBOL: Record<Operator, string> = {
  GT: '>',
  GTE: '>=',
  LT: '<',
  LTE: '<=',
  EQ: '=',
  NEQ: '!=',
  BETWEEN: 'between',
};
