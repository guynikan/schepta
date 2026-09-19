import { describe, expect, it } from 'vitest';
import {
  createDeterministicDecisionProvider,
  createGenerateUi,
  createOnboardingFixtureProvider,
  createOpenAIUiProvider,
  createTypeSafeJevDecisionProvider,
  evaluateUiCandidates,
  onboardingCatalog,
  onboardingSpec,
} from './index';
import type { StructuredGenerationProvider } from './generation';

describe('model-backed semantic UI generation', () => {
  it('generates a valid onboarding spec entirely offline', async () => {
    const result = await createGenerateUi(createOnboardingFixtureProvider())(
      'Create onboarding',
      { userType: 'new' },
      onboardingCatalog,
    );

    expect(result.spec).toEqual(onboardingSpec);
    expect(result.validation.valid).toBe(true);
    expect(result.trace.confidence).toBe(0.99);
    expect(result.trace.fallbackUsed).toBe(false);
  });

  it('uses a deterministic fallback when a provider returns invalid JSON data', async () => {
    const invalidProvider: StructuredGenerationProvider = {
      name: 'invalid-fixture',
      async generate() {
        return { candidate: { jsx: '<div>unsafe</div>' } };
      },
    };
    const result = await createGenerateUi(invalidProvider)('onboarding', {}, onboardingCatalog);

    expect(result.spec).toBeDefined();
    expect(result.validation.valid).toBe(true);
    expect(result.trace.fallbackUsed).toBe(true);
    expect(result.error?.code).toBe('validation-failed');
    expect(result.trace.failures[0]?.code).toBe('validation-failed');
  });

  it('returns a structured provider error when no fallback can be built', async () => {
    const provider: StructuredGenerationProvider = {
      name: 'failing-fixture',
      async generate() {
        throw new Error('offline');
      },
    };
    const result = await createGenerateUi(provider)('anything', {}, { components: {} });

    expect(result.spec).toBeUndefined();
    expect(result.error?.code).toBe('provider-failure');
    expect(result.trace.failures[0]?.message).toBe('offline');
  });

  it('allows deterministic candidate selection in place of JEV', async () => {
    const result = await createGenerateUi(createOnboardingFixtureProvider(), {
      decisionProvider: createDeterministicDecisionProvider(),
    })('onboarding', {}, onboardingCatalog);

    expect(result.spec).toBeDefined();
    expect(result.trace.decisions).toEqual([]);
  });

  it('evaluates only semantically valid candidates before selection', async () => {
    const result = await evaluateUiCandidates({
      question: 'Choose a valid onboarding screen',
      context: {},
      candidates: [
        { id: 'invalid', spec: { version: '1.0', root: 'missing', elements: {} } },
        { id: 'valid', spec: onboardingSpec },
      ],
    }, onboardingCatalog);

    expect(result.selected.id).toBe('valid');
  });

  it('sends only semantic JSON instructions to an OpenAI-compatible model', async () => {
    let requestBody: Record<string, unknown> | undefined;
    const provider = createOpenAIUiProvider({
      apiKey: 'test-key',
      fetch: async (_input, init) => {
        requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(onboardingSpec) } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      },
    });
    const result = await createGenerateUi(provider)('onboarding', {}, onboardingCatalog);

    expect(result.validation.valid).toBe(true);
    expect(JSON.stringify(requestBody)).not.toContain('<div>');
    expect(result.trace.usage).toEqual({ inputTokens: 10, outputTokens: 20, totalTokens: 30 });
  });

  it('keeps the TypeSafe key out of traces and supports injected fetch', async () => {
    let requestUrl: string | undefined;
    let requestBody: unknown;
    const provider = createTypeSafeJevDecisionProvider({
      apiKey: 'secret-key',
      fetch: async (_input, init) => {
        expect((init?.headers as Record<string, string>).authorization).toBe('Bearer secret-key');
        requestUrl = String(_input);
        requestBody = JSON.parse(String(init?.body));
        return new Response(JSON.stringify({
          model: 'jev-latest',
          answers: {
            ui_candidate: {
              type: 'choice',
              choice: 'model',
              probabilities: { model: 0.91, fallback: 0.09 },
              confidence: 0.91,
            },
          },
          usage: { input_tokens: 12, output_tokens: 0 },
        }), { status: 200 });
      },
    });
    const decision = await provider.decide({
      question: 'Choose the valid UI',
      context: { surface: 'onboarding' },
      candidates: [
        { id: 'model', label: 'Model candidate', spec: onboardingSpec },
        { id: 'fallback', label: 'Fallback candidate', spec: onboardingSpec },
      ],
    });

    expect(requestUrl).toBe('https://api.typesafe.ai/v1/systemone');
    expect(requestBody).toEqual({
      model: 'jev-latest',
      state: { surface: 'onboarding' },
      questions: {
        ui_candidate: {
          type: 'choice',
          instructions: 'Choose the valid UI',
          criteria: { model: 'Model candidate', fallback: 'Fallback candidate' },
        },
      },
    });
    expect(decision.selectedCandidateId).toBe('model');
    expect(decision.probabilities).toEqual({ model: 0.91, fallback: 0.09 });
    expect(decision.confidence).toBe(0.91);
    expect(decision.usage).toEqual({ inputTokens: 12, outputTokens: 0 });
    expect(JSON.stringify(decision)).not.toContain('secret-key');
  });
});
