import { compileCatalogToInstructions, createGenerateUi, type GenerateUiOptions, type StructuredGenerationProvider, type StructuredGenerationRequest, type StructuredGenerationResult } from './generation';
import type { SemanticCatalog, UiGenerationResponse, UiGenerationUsage } from './types';

export interface OpenAIUiProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  fetch?: typeof globalThis.fetch;
}

export class UiModelProviderError extends Error {
  constructor(public readonly code: string, message: string, public readonly retryable = false) {
    super(message);
    this.name = 'UiModelProviderError';
  }
}

/**
 * OpenAI-compatible structured-output adapter. The response schema contains
 * only semantic JSON, so JSX, Vue templates and library-specific code cannot
 * cross this boundary.
 */
export function createOpenAIUiProvider(options: OpenAIUiProviderOptions = {}): StructuredGenerationProvider {
  const apiKey = options.apiKey ?? (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : undefined);
  const endpoint = options.endpoint ?? 'https://api.openai.com/v1/chat/completions';
  const model = options.model ?? 'gpt-4o-mini';
  const fetchImpl = options.fetch ?? globalThis.fetch;
  return {
    name: 'openai-structured',
    async generate(request: StructuredGenerationRequest): Promise<StructuredGenerationResult> {
      if (!apiKey) throw new UiModelProviderError('missing-api-key', 'OpenAI structured generation requires OPENAI_API_KEY.', false);
      if (!fetchImpl) throw new UiModelProviderError('fetch-unavailable', 'A fetch implementation is required for model generation.', false);
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            { role: 'system', content: request.instructions },
            { role: 'user', content: `Prompt:\n${request.prompt}\nContext:\n${JSON.stringify(request.context)}` },
          ],
          response_format: {
            type: 'json_schema',
            // Keep optional UiSpec members optional. JSON-schema mode still
            // guarantees a JSON document, while strict mode would require
            // every semantic field to be present in every generated spec.
            json_schema: { name: 'schepta_ui_spec', strict: false, schema: request.schema },
          },
        }),
        signal: request.signal,
      });
      const body = await response.json() as unknown;
      if (!response.ok) throw new UiModelProviderError('provider-http-error', `Model provider returned HTTP ${response.status}.`, response.status >= 500 || response.status === 429);
      const text = extractChatCompletionText(body);
      let candidate: unknown;
      try {
        candidate = JSON.parse(text);
      } catch {
        throw new UiModelProviderError('invalid-json', 'Model provider returned non-JSON structured output.');
      }
      const usage = extractUsage(body);
      return { candidate, ...(usage ? { usage } : {}), model };
    },
  };
}

export interface OpenAIUiGenerator {
  generateUi: (
    prompt: string,
    context: Parameters<ReturnType<typeof createGenerateUi>>[1],
    catalog: SemanticCatalog,
    options?: GenerateUiOptions,
  ) => Promise<UiGenerationResponse>;
}

/** Convenience facade exposing the requested `generateUi(prompt, context, catalog)` shape. */
export function createOpenAIUiGenerator(
  providerOptions: OpenAIUiProviderOptions = {},
  generationOptions: GenerateUiOptions = {},
): OpenAIUiGenerator {
  return { generateUi: createGenerateUi(createOpenAIUiProvider(providerOptions), generationOptions) };
}

/** Build the exact system instructions used by model adapters and tests. */
export function buildModelInstructions(catalog: SemanticCatalog): string {
  return compileCatalogToInstructions(catalog);
}

function extractChatCompletionText(input: unknown): string {
  if (!input || typeof input !== 'object') throw new UiModelProviderError('invalid-response', 'Model provider returned a non-object response.');
  const record = input as Record<string, unknown>;
  const choices = Array.isArray(record.choices) ? record.choices : [];
  const first = choices[0] && typeof choices[0] === 'object' ? choices[0] as Record<string, unknown> : undefined;
  const message = first?.message && typeof first.message === 'object' ? first.message as Record<string, unknown> : undefined;
  const content = message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const text = content.find((part) => part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') as Record<string, unknown> | undefined;
    if (typeof text?.text === 'string') return text.text;
  }
  throw new UiModelProviderError('invalid-response', 'Model provider response did not contain message content.');
}

function extractUsage(input: unknown): UiGenerationUsage | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const usage = (input as Record<string, unknown>).usage;
  if (!usage || typeof usage !== 'object') return undefined;
  const record = usage as Record<string, unknown>;
  const result: UiGenerationUsage = {
    ...(typeof record.prompt_tokens === 'number' ? { inputTokens: record.prompt_tokens } : {}),
    ...(typeof record.completion_tokens === 'number' ? { outputTokens: record.completion_tokens } : {}),
    ...(typeof record.total_tokens === 'number' ? { totalTokens: record.total_tokens } : {}),
  };
  return Object.keys(result).length > 0 ? result : undefined;
}
