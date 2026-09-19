import { canonicalizeUiSpec } from './canonicalize';
import { validateUiSpec } from './validator';
import type { UiRepairOptions, UiRepairResult, UiSpec } from './types';

const SPEC_KEYS = new Set(['version', 'root', 'elements', 'state', 'bindings', 'actions', 'metadata']);
const ELEMENT_KEYS = new Set(['component', 'props', 'children', 'slots', 'bindings', 'actions']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function removeUnknownProperties(input: unknown, changes: UiRepairResult['changes'], maxChanges: number): unknown {
  if (!isRecord(input) || changes.length >= maxChanges) return input;
  for (const key of Object.keys(input)) {
    if (!SPEC_KEYS.has(key)) {
      delete input[key];
      changes.push({ operation: 'removeUnknownProperties', path: `/${key}`, description: `Removed unknown UiSpec property "${key}".` });
    }
  }
  if (isRecord(input.elements)) {
    for (const [id, element] of Object.entries(input.elements)) {
      if (!isRecord(element)) continue;
      for (const key of Object.keys(element)) {
        if (changes.length >= maxChanges) return input;
        if (!ELEMENT_KEYS.has(key)) {
          delete element[key];
          changes.push({ operation: 'removeUnknownProperties', path: `/elements/${id}/${key}`, description: `Removed unknown element property "${key}".` });
        }
      }
    }
  }
  return input;
}

/**
 * Apply only explicitly requested, bounded repairs. No expressions, code or
 * inferred semantic values are executed or invented.
 */
export function repairUiSpec(input: unknown, options: UiRepairOptions = {}): UiRepairResult {
  const changes: UiRepairResult['changes'] = [];
  const maxChanges = Math.max(0, options.maxChanges ?? 50);
  let candidate: unknown = input;

  // Never let JSON serialization silently discard functions, cycles or other
  // unsafe values before validation has had a chance to reject them.
  const originalReport = validateUiSpec(input, options);
  if (originalReport.errors.some((error) => error.code === 'unsafe-input')) {
    return { accepted: false, report: originalReport, changes };
  }

  try {
    candidate = JSON.parse(JSON.stringify(input));
  } catch {
    return { accepted: false, report: validateUiSpec(input, options), changes };
  }

  if (options.operations?.includes('removeUnknownProperties')) {
    candidate = removeUnknownProperties(candidate, changes, maxChanges);
  }
  if (options.operations?.includes('canonicalize')) {
    candidate = canonicalizeUiSpec(candidate as UiSpec);
    changes.push({ operation: 'canonicalize', path: '/', description: 'Canonicalized object keys without changing array order or values.' });
  }

  const report = validateUiSpec(candidate, options);
  return report.valid
    ? { accepted: true, spec: canonicalizeUiSpec(candidate as UiSpec), report, changes }
    : { accepted: false, report, changes };
}

/** Accept only a valid, canonical, JSON-only spec. */
export function acceptUiSpec(input: unknown, options: UiRepairOptions = {}): UiRepairResult {
  return repairUiSpec(input, { ...options, operations: ['canonicalize'] });
}

export class UiSpecValidationError extends Error {
  constructor(public readonly report: ReturnType<typeof validateUiSpec>) {
    super(`UiSpec rejected with ${report.errors.length} validation error(s).`);
    this.name = 'UiSpecValidationError';
  }
}

export function assertUiSpec(input: unknown, options: UiRepairOptions = {}): UiSpec {
  const result = acceptUiSpec(input, options);
  if (!result.accepted || !result.spec) throw new UiSpecValidationError(result.report);
  return result.spec;
}
