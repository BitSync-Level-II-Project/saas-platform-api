import { OPERATOR_SYMBOL, type Notify, type Operator, type Severity } from '../types.js';

export interface ConditionRule {
  operator: Operator;
  thresholdValue?: number | null;
  thresholdMax?: number | null;
  fieldKey?: string;
}

export function evaluate(rule: ConditionRule, value: number): boolean {
  const t = rule.thresholdValue ?? 0;
  const m = rule.thresholdMax ?? t;
  switch (rule.operator) {
    case 'GT':
      return value > t;
    case 'GTE':
      return value >= t;
    case 'LT':
      return value < t;
    case 'LTE':
      return value <= t;
    case 'EQ':
      return value === t;
    case 'NEQ':
      return value !== t;
    case 'BETWEEN':
      return value >= t && value <= m;
    default:
      return false;
  }
}

export function getByPath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== 'object') return undefined;
  return path
    .split('.')
    .reduce<unknown>(
      (o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]),
      obj,
    );
}

export function conditionText(r: ConditionRule): string {
  const op = OPERATOR_SYMBOL[r.operator ?? 'GT'];
  const range =
    r.operator === 'BETWEEN'
      ? `${r.thresholdValue ?? '?'} and ${r.thresholdMax ?? '?'}`
      : `${r.thresholdValue ?? '?'}`;
  return `${r.fieldKey || '[field]'} ${op} ${range}`;
}

export function alertMessage(
  rule: ConditionRule & { fieldKey: string },
  value: number,
): string {
  return `${rule.fieldKey} = ${value} (rule: ${conditionText(rule)})`;
}

export function notifyOf(rule: {
  notify?: Notify | null;
  severity: Severity;
}): Notify {
  if (rule.notify) return rule.notify;
  return rule.severity === 'HIGH' || rule.severity === 'CRITICAL'
    ? 'SUPERVISOR_MANAGER'
    : 'SUPERVISOR';
}
