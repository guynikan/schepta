import {
  createGenerateUi,
  createOpenAIUiProvider,
  createTypeSafeJevDecisionProvider,
  type DecisionProvider,
  type StructuredGenerationProvider,
} from '@schepta/core';
import { demoCatalog, demoSpec, type DemoMode, type PublicGenerationResponse } from '../shared';

function createOfflineProvider(): StructuredGenerationProvider {
  return {
    name: 'offline-fixture',
    async generate() {
      return { candidate: demoSpec, confidence: 1, model: 'deterministic-fixture' };
    },
  };
}

function buildPublicResponse(response: Awaited<ReturnType<ReturnType<typeof createGenerateUi>>>): PublicGenerationResponse {
  // Deliberately omit candidate and error details: this endpoint exposes only
  // the accepted semantic spec plus safe validation and trace information.
  return {
    spec: response.spec ?? demoSpec,
    validation: response.validation,
    trace: response.trace,
  };
}

/** Generate on the server so credentials never enter browser code or URLs. */
export async function generateForPrompt(prompt: string, mode: DemoMode): Promise<PublicGenerationResponse> {
  const provider = mode === 'openai' && process.env.OPENAI_API_KEY
    ? createOpenAIUiProvider({ apiKey: process.env.OPENAI_API_KEY })
    : mode === 'openai'
      ? createOpenAIUiProvider()
      : createOfflineProvider();

  const jevEnabled = Boolean(process.env.TYPESAFE_API_KEY);
  const decisionProvider: DecisionProvider | undefined = jevEnabled
    ? createTypeSafeJevDecisionProvider({ apiKey: process.env.TYPESAFE_API_KEY })
    : undefined;

  const generate = createGenerateUi(provider, {
    timeoutMs: 15_000,
    fallbackSpec: demoSpec,
  });
  const generated = await generate(prompt, { mode, request: 'semantic-ui' }, demoCatalog);

  // The core generator selects a fallback only after model failure. When JEV
  // is enabled, explicitly rank the accepted model and deterministic fallback
  // so the demo can expose the typed routing decision in its trace.
  if (decisionProvider && generated.spec) {
    try {
      const selected = await decisionProvider.select({
        question: prompt,
        context: { mode, request: 'semantic-ui' },
        catalog: demoCatalog,
        candidates: [
          { id: 'model', label: 'Model-generated semantic UI', spec: generated.spec },
          { id: 'fallback', label: 'Deterministic semantic UI fallback', spec: demoSpec },
        ],
      });
      generated.spec = selected.selected.spec;
      generated.trace.fallbackUsed = selected.selected.id === 'fallback';
      generated.trace.decisions.push({
        provider: selected.decision?.provider ?? decisionProvider.name,
        selectedCandidateId: selected.selected.id,
        ...(selected.decision?.confidence !== undefined ? { confidence: selected.decision.confidence } : {}),
        ...(selected.decision?.probabilities ? { probabilities: selected.decision.probabilities } : {}),
        ...(selected.decision?.reason ? { reason: selected.decision.reason } : {}),
        ...(selected.decision?.latencyMs !== undefined ? { latencyMs: selected.decision.latencyMs } : {}),
        ...(selected.decision?.usage ? { usage: selected.decision.usage } : {}),
      });
    } catch {
      generated.trace.failures.push({ code: 'decision-provider-failure', message: 'TypeSafe System One decision was unavailable; kept the accepted UiSpec.' });
    }
  }
  return buildPublicResponse(generated);
}
