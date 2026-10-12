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

## Expression diagnostics

Template expressions are checked when schemas are rendered. Syntax/evaluation
errors, unknown expression roots, and paths that are not declared in the form
schema or external context emit one diagnostic per expression and schema path.
Declared form fields that have not been filled in yet remain quiet and resolve
to `undefined`, preserving the existing interpolation behavior.

Invalid conditional expressions use safe defaults: `visible` remains visible,
while `disabled` and `required` remain unset. The default is non-breaking:
diagnostics are sent to the configured debug context and to `console.warn`
outside production. To make these schema errors fail fast, configure a provider
or factory with strict expression handling:

```ts
const expressions = { onError: 'throw' as const };

// Provider: <ScheptaProvider expressions={expressions} />
// Factory:  <FormFactory expressions={expressions} schema={schema} />
```

Strict mode throws `ScheptaExpressionError`, whose `code`, `expression`,
`path`, and optional `missingPath` make errors suitable for reporting tools.
Use `onExpressionError` in the same configuration object to receive each
deduplicated diagnostic programmatically.

External context has no schema declaration. A missing nested path below an
existing external-context root emits a warning only, so asynchronous data may
arrive later; strict mode throws only when that root key itself is absent.

## License

MIT

