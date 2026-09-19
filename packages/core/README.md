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

## Local UiSpec tooling

The core package deliberately does not generate UI, call model providers, host
an API, or choose fallbacks. A Codex Skill is the generation boundary: it
inspects the built-in catalog, writes JSON, validates it, and may submit at
most two corrected candidates using the structured errors.

```bash
pnpm --filter @schepta/core build
node packages/core/dist/ui-spec.mjs catalog
node packages/core/dist/ui-spec.mjs validate path/to/ui.json
node packages/core/dist/ui-spec.mjs normalize path/to/ui.json
```

`semanticUiCatalog` is the built-in vocabulary used by both renderer adapters. It preserves
the validation constraints represented by the MUI renderer (required,
placeholder, min/max length, pattern, standardized input messages, state,
bindings and declarative actions). FormSchema remains the separate original
form workflow and is not embedded in UiSpec.

## License

MIT
