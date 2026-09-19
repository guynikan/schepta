# @schepta/core

Core framework-agnostic rendering engine for schepta. This package provides the foundational logic for rendering JSON schemas into UI components.

## Installation

```bash
npm install @schepta/core
```

## Usage

```typescript
import { 
  ComponentRegistry, 
  RendererRegistry, 
  componentOrchestrator,
  createComponentSpec 
} from '@schepta/core';

// Create component registry
const registry = new ComponentRegistry();

// Register a component
registry.register(
  createComponentSpec({
    id: 'my-component',
    type: 'field',
    factory: (props, runtime) => MyComponent,
  })
);

// Create component orchestrator
const orchestrator = new componentOrchestrator(registry);
```

## Documentation

For complete documentation, visit [https://schepta.dev](https://schepta.dev)

## Semantic Generative UI

The core package also exposes a framework-independent, versioned `UiSpec` contract. A spec contains a root element, semantic elements, state, bindings and declarative action invocations. Catalogs describe component props, slots, actions and renderer capabilities; they do not contain React, Vue or design-system objects.

```typescript
import {
  acceptUiSpec,
  createSemanticCatalog,
  type UiSpec,
} from '@schepta/core';

const catalog = createSemanticCatalog({
  components: {
    Stack: { slots: { content: { multiple: true } } },
    Button: { capabilities: ['interactive'] },
  },
  actions: {
    submit: { argsSchema: { type: 'object', additionalProperties: false } },
  },
});

const spec: UiSpec = {
  version: '1.0',
  root: 'screen',
  elements: {
    screen: { component: 'Stack', slots: { content: ['save'] } },
    save: { component: 'Button', actions: { press: 'saveAction' } },
  },
  actions: { saveAction: { action: 'submit', args: {} } },
};

const result = acceptUiSpec(spec, {
  catalog,
  rendererCapabilities: {
    components: ['Stack', 'Button'],
    actions: ['submit'],
    capabilities: ['interactive'],
  },
});

if (!result.accepted) console.error(result.report.errors);
```

`acceptUiSpec` rejects non-JSON values, unsupported versions, unknown catalog entries, invalid props/action inputs and missing renderer capabilities. `canonicalizeUiSpec` and `stringifyCanonicalUiSpec` provide stable keys for hashing and caching. `repairUiSpec` only performs explicitly requested bounded repairs (`canonicalize` and/or `removeUnknownProperties`); it never executes expressions or invents semantic values.

## Model generation and experimental JEV decisions

Model generation is exposed through a provider-neutral adapter contract. Adapters return structured JSON candidates and never return JSX, Vue templates or renderer-library code:

```typescript
import {
  createGenerateUi,
  createOpenAIUiProvider,
  createTypeSafeJevDecisionProvider,
} from '@schepta/core';

const generateUi = createGenerateUi(createOpenAIUiProvider());
const result = await generateUi('Create an onboarding screen', {}, catalog, {
  decisionProvider: createTypeSafeJevDecisionProvider(),
});
```

The OpenAI-compatible adapter reads `OPENAI_API_KEY` and defaults to `gpt-4o-mini`; the experimental TypeSafe Jev adapter reads `TYPESAFE_API_KEY`. Neither key is stored in the repository or in generation traces. If a key is unavailable, the adapter returns a structured failure and the generation layer can use a bounded deterministic fallback. Tests can use `createOnboardingFixtureProvider` and `createDeterministicDecisionProvider` without network access.

## License

MIT
