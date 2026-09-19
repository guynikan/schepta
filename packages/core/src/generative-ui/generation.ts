import { acceptUiSpec, repairUiSpec } from './repair';
import { validateUiSpec } from './validator';
import type {
  JsonObject,
  JsonValue,
  RendererCapabilities,
  SemanticCatalog,
  UiGenerationContext,
  UiGenerationDecision,
  UiGenerationError,
  UiGenerationFailure,
  UiGenerationResponse,
  UiGenerationTrace,
  UiGenerationUsage,
  UiSpec,
  UiValidationReport,
} from './types';
import type { DecisionProvider, UiCandidate, UiCandidateSelectionResult } from './decision';

export interface StructuredGenerationRequest {
  prompt: string;
  context: UiGenerationContext;
  catalog: SemanticCatalog;
  instructions: string;
  schema: JsonObject;
  signal?: AbortSignal;
}

export interface StructuredGenerationResult {
  /** The provider must return JSON data, never framework code or markup. */
  candidate: unknown;
  usage?: UiGenerationUsage;
  confidence?: number;
  model?: string;
}

/** Provider-neutral adapter contract for model-backed structured generation. */
export interface StructuredGenerationProvider {
  readonly name: string;
  generate(request: StructuredGenerationRequest): Promise<StructuredGenerationResult>;
}

/** Alias for consumers that prefer the UI-specific provider terminology. */
export type UiGenerationProvider = StructuredGenerationProvider;

export interface GenerateUiOptions {
  timeoutMs?: number;
  maxRepairChanges?: number;
  rendererCapabilities?: RendererCapabilities;
  fallbackSpec?: UiSpec;
  decisionProvider?: DecisionProvider;
}

export type GenerateUi = (
  prompt: string,
  context: UiGenerationContext,
  catalog: SemanticCatalog,
  options?: GenerateUiOptions,
) => Promise<UiGenerationResponse>;

function now(): string {
  return new Date().toISOString();
}

function reportForUnknown(value: unknown, catalog: SemanticCatalog, options: GenerateUiOptions): UiValidationReport {
  return validateUiSpec(value, {
    catalog,
    rendererCapabilities: options.rendererCapabilities,
  });
}

function errorFromUnknown(error: unknown, fallbackCode: string): UiGenerationError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const record = error as { code?: unknown; message?: unknown; retryable?: unknown };
    return {
      code: typeof record.code === 'string' ? record.code : fallbackCode,
      message: typeof record.message === 'string' ? record.message : String(error),
      ...(typeof record.retryable === 'boolean' ? { retryable: record.retryable } : {}),
    };
  }
  return { code: fallbackCode, message: error instanceof Error ? error.message : String(error) };
}

function failureFromError(error: UiGenerationError): UiGenerationFailure {
  return { code: error.code, message: error.message, ...(error.retryable !== undefined ? { retryable: error.retryable } : {}) };
}

function deterministicFallback(catalog: SemanticCatalog): UiSpec | undefined {
  const componentEntries = Object.entries(catalog.components);
  if (componentEntries.length === 0) return undefined;

  const [rootComponent, rootDefinition] = componentEntries.find(([, definition]) => definition.slots && Object.keys(definition.slots).length > 0)
    ?? componentEntries[0];
  const elements: UiSpec['elements'] = { root: { component: rootComponent } };
  const slotName = rootDefinition.slots && Object.keys(rootDefinition.slots).find((name) => rootDefinition.slots?.[name]?.multiple !== false);
  const child = componentEntries.find(([name, definition]) => {
    if (name === rootComponent) return false;
    const schema = definition.propsSchema ?? definition.props;
    const required = schema && Array.isArray(schema.required) ? schema.required : [];
    return required.length === 0;
  });
  if (slotName && child) {
    elements.child = { component: child[0] };
    elements.root.slots = { [slotName]: ['child'] };
  }
  return { version: '1.0', root: 'root', elements };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  if (timeoutMs <= 0) return Promise.reject(new Error('Generation timeout must be greater than zero.'));
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(Object.assign(new Error(`Generation timed out after ${timeoutMs}ms.`), { code: 'timeout', retryable: true }));
    }, timeoutMs);
    const onAbort = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(Object.assign(new Error('Generation was aborted.'), { code: 'aborted', retryable: true }));
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }
    promise.then((value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      resolve(value);
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(error);
    });
  });
}

function candidateFromResult(result: StructuredGenerationResult | undefined): unknown {
  return result?.candidate;
}

async function selectCandidate(
  prompt: string,
  context: UiGenerationContext,
  candidates: UiCandidate[],
  provider: DecisionProvider | undefined,
): Promise<UiCandidateSelectionResult> {
  if (candidates.length === 1 || !provider) {
    return { selected: candidates[0], decision: undefined };
  }
  return provider.select({ question: prompt, context, candidates });
}

function finishTrace(
  provider: StructuredGenerationProvider,
  startedAt: string,
  startedMs: number,
  failures: UiGenerationFailure[],
  decisions: UiGenerationDecision[],
  fallbackUsed: boolean,
  repairAttempts: number,
  result?: StructuredGenerationResult,
): UiGenerationTrace {
  const decisionUsage = decisions.reduce((total, decision) => ({
    ...(total.inputTokens !== undefined || decision.usage?.inputTokens !== undefined ? { inputTokens: (total.inputTokens ?? 0) + (decision.usage?.inputTokens ?? 0) } : {}),
    ...(total.outputTokens !== undefined || decision.usage?.outputTokens !== undefined ? { outputTokens: (total.outputTokens ?? 0) + (decision.usage?.outputTokens ?? 0) } : {}),
    ...(total.totalTokens !== undefined || decision.usage?.totalTokens !== undefined ? { totalTokens: (total.totalTokens ?? 0) + (decision.usage?.totalTokens ?? 0) } : {}),
  }), {} as UiGenerationUsage);
  const usage = result?.usage || Object.keys(decisionUsage).length > 0
    ? {
        ...(result?.usage?.inputTokens !== undefined || decisionUsage.inputTokens !== undefined ? { inputTokens: (result?.usage?.inputTokens ?? 0) + (decisionUsage.inputTokens ?? 0) } : {}),
        ...(result?.usage?.outputTokens !== undefined || decisionUsage.outputTokens !== undefined ? { outputTokens: (result?.usage?.outputTokens ?? 0) + (decisionUsage.outputTokens ?? 0) } : {}),
        ...(result?.usage?.totalTokens !== undefined || decisionUsage.totalTokens !== undefined ? { totalTokens: (result?.usage?.totalTokens ?? 0) + (decisionUsage.totalTokens ?? 0) } : {}),
      }
    : undefined;
  return {
    provider: provider.name,
    ...(result?.model ? { model: result.model } : {}),
    startedAt,
    completedAt: now(),
    latencyMs: Math.max(0, Date.now() - startedMs),
    ...(result?.confidence !== undefined ? { confidence: result.confidence } : {}),
    decisions,
    ...(usage ? { usage } : {}),
    failures,
    fallbackUsed,
    repairAttempts,
  };
}

/** Create the provider-neutral `generateUi(prompt, context, catalog)` function. */
export function createGenerateUi(provider: StructuredGenerationProvider, defaults: GenerateUiOptions = {}): GenerateUi {
  return async (prompt, context, catalog, options = {}): Promise<UiGenerationResponse> => {
    const resolved = { ...defaults, ...options };
    const startedMs = Date.now();
    const startedAt = now();
    const failures: UiGenerationFailure[] = [];
    const decisions: UiGenerationDecision[] = [];
    let repairAttempts = 0;
    let rawResult: StructuredGenerationResult | undefined;
    let candidate: UiSpec | undefined;
    let validation = validateUiSpec(undefined, { catalog, rendererCapabilities: resolved.rendererCapabilities });

    try {
      const generationController = new AbortController();
      rawResult = await withTimeout(provider.generate({
        prompt,
        context,
        catalog,
        instructions: compileCatalogToInstructions(catalog),
        schema: uiSpecJsonSchema(),
        signal: generationController.signal,
      }), resolved.timeoutMs ?? 10_000).catch((error: unknown) => {
        generationController.abort();
        throw error;
      });
      validation = reportForUnknown(candidateFromResult(rawResult), catalog, resolved);
      if (validation.valid) {
        const accepted = acceptUiSpec(candidateFromResult(rawResult), {
          catalog,
          rendererCapabilities: resolved.rendererCapabilities,
        });
        candidate = accepted.spec;
      } else {
        repairAttempts = 1;
        const repaired = repairUiSpec(candidateFromResult(rawResult), {
          catalog,
          rendererCapabilities: resolved.rendererCapabilities,
          operations: ['removeUnknownProperties', 'canonicalize'],
          maxChanges: resolved.maxRepairChanges ?? 8,
        });
        validation = repaired.report;
        candidate = repaired.spec;
        if (!candidate) {
          failures.push({
            code: 'validation-failed',
            message: validation.errors.map((entry) => `${entry.path}: ${entry.message}`).join(' '),
          });
        }
      }
    } catch (error) {
      const failure = errorFromUnknown(error, 'provider-failure');
      failures.push(failureFromError(failure));
    }

    const fallback = candidate ? undefined : resolved.fallbackSpec ?? deterministicFallback(catalog);
    let fallbackUsed = false;
    const candidates: UiCandidate[] = [];
    if (candidate) candidates.push({ id: 'model', spec: candidate });
    if (fallback) {
      const fallbackReport = validateUiSpec(fallback, { catalog, rendererCapabilities: resolved.rendererCapabilities });
      if (fallbackReport.valid) candidates.push({ id: 'fallback', spec: fallback });
      else failures.push({ code: 'fallback-invalid', message: fallbackReport.errors.map((entry) => entry.message).join(' ') });
    }

    if (candidates.length > 0) {
      const selected = await selectCandidate(prompt, context, candidates, resolved.decisionProvider).catch((error: unknown) => {
        const failure = errorFromUnknown(error, 'decision-provider-failure');
        failures.push(failureFromError(failure));
        return { selected: candidates[0], decision: undefined };
      });
      if (selected.decision) {
        decisions.push({
          provider: selected.decision.provider,
          ...(selected.decision.selectedCandidateId ? { selectedCandidateId: selected.decision.selectedCandidateId } : {}),
          ...(selected.decision.confidence !== undefined ? { confidence: selected.decision.confidence } : {}),
          ...(selected.decision.probabilities ? { probabilities: selected.decision.probabilities } : {}),
          ...(selected.decision.reason ? { reason: selected.decision.reason } : {}),
          ...(selected.decision.latencyMs !== undefined ? { latencyMs: selected.decision.latencyMs } : {}),
          ...(selected.decision.usage ? { usage: selected.decision.usage } : {}),
        });
      }
      fallbackUsed = selected.selected.id === 'fallback';
      const selectedValidation = validateUiSpec(selected.selected.spec, { catalog, rendererCapabilities: resolved.rendererCapabilities });
      return {
        ...(candidate ? { candidate } : {}),
        spec: selected.selected.spec,
        validation: selectedValidation,
        trace: finishTrace(provider, startedAt, startedMs, failures, decisions, fallbackUsed, repairAttempts, rawResult),
        ...(failures.length > 0 && !candidate ? { error: failures[0] } : {}),
      };
    }

    const error: UiGenerationError = failures[0] ?? { code: 'invalid-candidate', message: 'The provider did not return a valid UiSpec candidate.' };
    return {
      validation,
      trace: finishTrace(provider, startedAt, startedMs, failures, decisions, false, repairAttempts, rawResult),
      error,
    };
  };
}

export function compileCatalogToInstructions(catalog: SemanticCatalog): string {
  return [
    'Generate one semantic UiSpec as JSON only.',
    'Do not return JSX, Vue templates, JavaScript, CSS, renderer objects or prose.',
    'Use only components, props, slots and actions declared in this catalog.',
    'The output must use UiSpec version 1.0 and contain a reachable root element.',
    'Semantic catalog:',
    stableJson(catalog),
  ].join('\n');
}

/** Alias for callers that use the shorter generator naming. */
export const createUiGenerator = createGenerateUi;

/** Run a provider with the exact provider-neutral function shape. */
export function generateUi(
  provider: StructuredGenerationProvider,
  prompt: string,
  context: UiGenerationContext,
  catalog: SemanticCatalog,
  options?: GenerateUiOptions,
): Promise<UiGenerationResponse> {
  return createGenerateUi(provider)(prompt, context, catalog, options);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function uiSpecJsonSchema(): JsonObject {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'root', 'elements'],
    properties: {
      version: { type: 'string', enum: ['1.0'] },
      root: { type: 'string' },
      elements: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          additionalProperties: false,
          required: ['component'],
          properties: {
            component: { type: 'string' },
            props: { type: 'object' },
            children: { type: 'array', items: { type: 'string' } },
            slots: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
            bindings: { type: 'object', additionalProperties: { type: 'string' } },
            actions: { type: 'object', additionalProperties: { type: 'string' } },
          },
        },
      },
      state: { type: 'object' },
      bindings: { type: 'object' },
      actions: { type: 'object' },
      metadata: { type: 'object' },
    },
  };
}

export { deterministicFallback as createDeterministicUiFallback };
