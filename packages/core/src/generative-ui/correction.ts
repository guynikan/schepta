import { acceptUiSpec } from './repair';
import type { UiAcceptanceResult, UiRepairOptions } from './types';

export interface UiSpecCorrectionAttempt {
  attempt: number;
  report: UiAcceptanceResult['report'];
}

/**
 * Validate the initial candidate and at most two subsequent candidates.
 * A caller (for example a Codex Skill) owns generation; this function never
 * calls a model, network endpoint, or fallback generator.
 */
export function acceptCorrectedUiSpec(candidates: readonly unknown[], options: UiRepairOptions = {}): {
  accepted?: UiAcceptanceResult;
  attempts: UiSpecCorrectionAttempt[];
} {
  const attempts: UiSpecCorrectionAttempt[] = [];
  for (const [index, candidate] of candidates.slice(0, 3).entries()) {
    const result = acceptUiSpec(candidate, options);
    attempts.push({ attempt: index + 1, report: result.report });
    if (result.accepted && result.spec) return { accepted: { accepted: true, spec: result.spec, report: result.report }, attempts };
  }
  return { attempts };
}
