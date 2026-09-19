import type { JsonValue, SemanticCatalog, UiGenerationUsage, UiSpec } from './types';
import { validateUiSpec } from './validator';

export interface UiCandidate {
  id: string;
  spec: UiSpec;
  label?: string;
}

export interface DecisionRequest {
  question: string;
  context: JsonValue;
  candidates: readonly UiCandidate[];
  catalog?: SemanticCatalog;
}

export interface DecisionResponse {
  provider: string;
  selectedCandidateId: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  reason?: string;
  latencyMs?: number;
  usage?: UiGenerationUsage;
}

/** Provider-neutral decision boundary. TypeSafe System One is one implementation, not a core dependency. */
export interface DecisionProvider {
  readonly name: string;
  decide(request: DecisionRequest): Promise<DecisionResponse>;
  select(request: DecisionRequest): Promise<UiCandidateSelectionResult>;
}

export interface UiCandidateSelectionResult {
  selected: UiCandidate;
  decision?: DecisionResponse;
}

export class DecisionProviderError extends Error {
  constructor(public readonly code: string, message: string, public readonly retryable = false) {
    super(message);
    this.name = 'DecisionProviderError';
  }
}

function resolveSelection(request: DecisionRequest, response: DecisionResponse): UiCandidateSelectionResult {
  const selected = request.candidates.find((candidate) => candidate.id === response.selectedCandidateId);
  if (!selected) throw new DecisionProviderError('invalid-selection', `Decision provider selected unknown candidate "${response.selectedCandidateId}".`);
  return { selected, decision: response };
}

/** A zero-network decision provider intended for tests and deterministic deployments. */
export function createDeterministicDecisionProvider(selector?: (request: DecisionRequest) => string): DecisionProvider {
  const provider: DecisionProvider = {
    name: 'deterministic',
    async decide(request): Promise<DecisionResponse> {
      const selectedCandidateId = selector?.(request) ?? request.candidates[0]?.id;
      if (!selectedCandidateId) throw new DecisionProviderError('no-candidates', 'No candidates were supplied for a decision.');
      return { provider: provider.name, selectedCandidateId, confidence: 1, probabilities: { [selectedCandidateId]: 1 }, latencyMs: 0 };
    },
    async select(request): Promise<UiCandidateSelectionResult> {
      return resolveSelection(request, await provider.decide(request));
    },
  };
  return provider;
}

export interface TypeSafeJevDecisionProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}

/**
 * Experimental TypeSafe System One adapter. It is intentionally fetch-based so the
 * package stays dependency-free and tests can inject a fake fetch function.
 */
export function createTypeSafeJevDecisionProvider(options: TypeSafeJevDecisionProviderOptions = {}): DecisionProvider {
  const apiKey = options.apiKey ?? (typeof process !== 'undefined' ? process.env.TYPESAFE_API_KEY : undefined);
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const baseUrl = (options.baseUrl ?? 'https://api.typesafe.ai').replace(/\/$/, '');
  const timeoutMs = options.timeoutMs ?? 1_500;
  const model = options.model ?? 'jev-latest';

  const provider: DecisionProvider = {
    name: 'typesafe-jev',
    async decide(request): Promise<DecisionResponse> {
      if (!apiKey) throw new DecisionProviderError('missing-api-key', 'TypeSafe System One requires TYPESAFE_API_KEY.', false);
      if (!fetchImpl) throw new DecisionProviderError('fetch-unavailable', 'A fetch implementation is required for TypeSafe System One.', false);
      const startedMs = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${baseUrl}/v1/systemone`, {
          method: 'POST',
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model,
            state: request.context,
            questions: {
              ui_candidate: {
                type: 'choice',
                instructions: request.question,
                criteria: Object.fromEntries(request.candidates.map((candidate) => [candidate.id, candidate.label ?? candidate.id])),
              },
            },
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new DecisionProviderError('provider-http-error', `TypeSafe System One returned HTTP ${response.status}.`, response.status >= 500 || response.status === 429);
        const parsed = parseSystemOneResponse(await response.json() as unknown);
        return {
          provider: provider.name,
          selectedCandidateId: parsed.selectedCandidateId,
          ...(parsed.confidence !== undefined ? { confidence: parsed.confidence } : {}),
          ...(parsed.probabilities ? { probabilities: parsed.probabilities } : {}),
          ...(parsed.reason ? { reason: parsed.reason } : {}),
          latencyMs: Date.now() - startedMs,
          ...(parsed.usage ? { usage: parsed.usage } : {}),
        };
      } catch (error) {
        if (error instanceof DecisionProviderError) throw error;
        const isAbortError = error instanceof DOMException && error.name === 'AbortError'
          || error instanceof Error && error.name === 'AbortError';
        const message = error instanceof Error ? error.message : String(error);
        const safeMessage = apiKey ? message.split(apiKey).join('[redacted]') : message;
        throw new DecisionProviderError(isAbortError ? 'timeout' : 'provider-failure', safeMessage, true);
      } finally {
        clearTimeout(timer);
      }
    },
    async select(request): Promise<UiCandidateSelectionResult> {
      return resolveSelection(request, await provider.decide(request));
    },
  };
  return provider;
}

interface ParsedSystemOneResponse {
  selectedCandidateId: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  reason?: string;
  usage?: UiGenerationUsage;
}

function parseSystemOneResponse(input: unknown): ParsedSystemOneResponse {
  if (!input || typeof input !== 'object') throw new DecisionProviderError('invalid-response', 'TypeSafe System One returned a non-object response.');
  const record = input as Record<string, unknown>;
  const answers = record.answers && typeof record.answers === 'object' ? record.answers as Record<string, unknown> : undefined;
  const answer = answers?.ui_candidate && typeof answers.ui_candidate === 'object'
    ? answers.ui_candidate as Record<string, unknown>
    : undefined;
  const selected = answer?.choice;
  if (typeof selected !== 'string' || selected.length === 0) throw new DecisionProviderError('invalid-response', 'TypeSafe System One response did not contain a candidate selection.');
  const probabilities = answer?.probabilities && typeof answer.probabilities === 'object' && !Array.isArray(answer.probabilities)
    ? Object.fromEntries(Object.entries(answer.probabilities).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
    : undefined;
  const usageRecord = record.usage && typeof record.usage === 'object' ? record.usage as Record<string, unknown> : undefined;
  const usage = usageRecord ? {
    ...(typeof usageRecord.inputTokens === 'number' ? { inputTokens: usageRecord.inputTokens } : typeof usageRecord.input_tokens === 'number' ? { inputTokens: usageRecord.input_tokens } : {}),
    ...(typeof usageRecord.outputTokens === 'number' ? { outputTokens: usageRecord.outputTokens } : typeof usageRecord.output_tokens === 'number' ? { outputTokens: usageRecord.output_tokens } : {}),
    ...(typeof usageRecord.totalTokens === 'number' ? { totalTokens: usageRecord.totalTokens } : typeof usageRecord.total_tokens === 'number' ? { totalTokens: usageRecord.total_tokens } : {}),
  } : undefined;
  return {
    selectedCandidateId: selected,
    ...(typeof answer?.confidence === 'number' ? { confidence: answer.confidence } : {}),
    ...(probabilities && Object.keys(probabilities).length > 0 ? { probabilities } : {}),
    ...(typeof answer?.reason === 'string' ? { reason: answer.reason } : {}),
    ...(usage && Object.keys(usage).length > 0 ? { usage } : {}),
  };
}

export async function selectUiCandidate(
  request: DecisionRequest,
  provider: DecisionProvider = createDeterministicDecisionProvider(),
): Promise<UiCandidateSelectionResult> {
  return provider.select(request);
}

/** Validate candidates before a decision provider is allowed to rank them. */
export async function evaluateUiCandidates(
  request: DecisionRequest,
  catalog: SemanticCatalog,
  provider: DecisionProvider = createDeterministicDecisionProvider(),
): Promise<UiCandidateSelectionResult> {
  const validCandidates = request.candidates.filter((candidate) => validateUiSpec(candidate.spec, { catalog }).valid);
  if (validCandidates.length === 0) {
    throw new DecisionProviderError('no-valid-candidates', 'No candidate passed semantic UiSpec validation.');
  }
  return provider.select({ ...request, catalog, candidates: validCandidates });
}

/** Short alias for integrations that call the experimental adapter simply JEV. */
export const createJevDecisionProvider = createTypeSafeJevDecisionProvider;
