import type { StructuredGenerationProvider } from './generation';
import { createSemanticCatalog } from './catalog';
import type { SemanticCatalog, UiSpec } from './types';

export const onboardingCatalog: SemanticCatalog = createSemanticCatalog({
  version: 'fixture-1',
  components: {
    Stack: { description: 'A vertical layout container', slots: { content: { multiple: true } } },
    Heading: { propsSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'], additionalProperties: false } },
    TextInput: { propsSchema: { type: 'object', properties: { label: { type: 'string' } }, required: ['label'], additionalProperties: false } },
    Button: { propsSchema: { type: 'object', properties: { label: { type: 'string' } }, required: ['label'], additionalProperties: false } },
  },
  actions: { continue: { description: 'Continue onboarding', argsSchema: { type: 'object', additionalProperties: false } } },
});

export const onboardingSpec: UiSpec = {
  version: '1.0',
  root: 'screen',
  elements: {
    screen: { component: 'Stack', slots: { content: ['title', 'name', 'continue'] } },
    title: { component: 'Heading', props: { text: 'Welcome' } },
    name: { component: 'TextInput', props: { label: 'Your name' }, bindings: { value: 'nameValue' } },
    continue: { component: 'Button', props: { label: 'Continue' }, actions: { press: 'continueAction' } },
  },
  state: { name: { schema: { type: 'string' }, initial: '' } },
  bindings: { nameValue: { path: 'state.name', mode: 'twoWay' } },
  actions: { continueAction: { action: 'continue', args: {} } },
};

/** Offline fixture provider used by tests and examples; it never touches a network. */
export function createOnboardingFixtureProvider(): StructuredGenerationProvider {
  return {
    name: 'fixture-onboarding',
    async generate(): Promise<{ candidate: UiSpec; confidence: number }> {
      return { candidate: onboardingSpec, confidence: 0.99 };
    },
  };
}
