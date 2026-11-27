import { describe, expect, it } from 'vitest';
import {
  alertMessage,
  conditionText,
  evaluate,
  getByPath,
  notifyOf,
} from './rule-evaluator.js';

describe('RuleEvaluator Engine', () => {
  describe('evaluate operators', () => {
    it('evaluates GT (Greater Than)', () => {
      expect(evaluate({ operator: 'GT', thresholdValue: 80 }, 85)).toBe(true);
      expect(evaluate({ operator: 'GT', thresholdValue: 80 }, 80)).toBe(false);
      expect(evaluate({ operator: 'GT', thresholdValue: 80 }, 75)).toBe(false);
    });

    it('evaluates GTE (Greater Than or Equal)', () => {
      expect(evaluate({ operator: 'GTE', thresholdValue: 80 }, 85)).toBe(true);
      expect(evaluate({ operator: 'GTE', thresholdValue: 80 }, 80)).toBe(true);
      expect(evaluate({ operator: 'GTE', thresholdValue: 80 }, 79.9)).toBe(false);
    });

    it('evaluates LT (Less Than)', () => {
      expect(evaluate({ operator: 'LT', thresholdValue: 20 }, 15)).toBe(true);
      expect(evaluate({ operator: 'LT', thresholdValue: 20 }, 20)).toBe(false);
      expect(evaluate({ operator: 'LT', thresholdValue: 20 }, 25)).toBe(false);
    });

    it('evaluates LTE (Less Than or Equal)', () => {
      expect(evaluate({ operator: 'LTE', thresholdValue: 20 }, 15)).toBe(true);
      expect(evaluate({ operator: 'LTE', thresholdValue: 20 }, 20)).toBe(true);
      expect(evaluate({ operator: 'LTE', thresholdValue: 20 }, 20.1)).toBe(false);
    });

    it('evaluates EQ (Equal)', () => {
      expect(evaluate({ operator: 'EQ', thresholdValue: 100 }, 100)).toBe(true);
      expect(evaluate({ operator: 'EQ', thresholdValue: 100 }, 99)).toBe(false);
    });

    it('evaluates NEQ (Not Equal)', () => {
      expect(evaluate({ operator: 'NEQ', thresholdValue: 0 }, 1)).toBe(true);
      expect(evaluate({ operator: 'NEQ', thresholdValue: 0 }, 0)).toBe(false);
    });

    it('evaluates BETWEEN (Inclusive Range)', () => {
      const rule = { operator: 'BETWEEN' as const, thresholdValue: 10, thresholdMax: 20 };
      expect(evaluate(rule, 10)).toBe(true);
      expect(evaluate(rule, 15)).toBe(true);
      expect(evaluate(rule, 20)).toBe(true);
      expect(evaluate(rule, 9.9)).toBe(false);
      expect(evaluate(rule, 20.1)).toBe(false);
    });
  });

  describe('getByPath', () => {
    it('retrieves top-level properties', () => {
      const payload = { temperature: 85, soundDb: 92 };
      expect(getByPath(payload, 'temperature')).toBe(85);
      expect(getByPath(payload, 'soundDb')).toBe(92);
    });

    it('retrieves nested properties', () => {
      const payload = { machine: { telemetry: { pressure: 12.5 } } };
      expect(getByPath(payload, 'machine.telemetry.pressure')).toBe(12.5);
    });

    it('returns undefined for non-existent paths', () => {
      const payload = { temperature: 85 };
      expect(getByPath(payload, 'pressure')).toBeUndefined();
      expect(getByPath(payload, 'machine.pressure')).toBeUndefined();
    });
  });

  describe('formatting & notification resolution', () => {
    it('generates condition text and alert message correctly', () => {
      const rule = {
        fieldKey: 'temperature',
        operator: 'GT' as const,
        thresholdValue: 80,
      };
      expect(conditionText(rule)).toBe('temperature > 80');
      expect(alertMessage(rule, 85)).toBe('temperature = 85 (rule: temperature > 80)');
    });

    it('resolves notification recipients with severity defaults', () => {
      expect(notifyOf({ severity: 'CRITICAL' })).toBe('SUPERVISOR_MANAGER');
      expect(notifyOf({ severity: 'HIGH' })).toBe('SUPERVISOR_MANAGER');
      expect(notifyOf({ severity: 'MEDIUM' })).toBe('SUPERVISOR');
      expect(notifyOf({ severity: 'LOW' })).toBe('SUPERVISOR');
      expect(
        notifyOf({ notify: 'SUPERVISOR', severity: 'CRITICAL' }),
      ).toBe('SUPERVISOR');
    });
  });
});
