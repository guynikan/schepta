# @schepta/core

Core framework-agnostic rendering engine for Spectra. This package provides the foundational logic for rendering JSON schemas into UI components.

## Installation

```bash
npm install @schepta/core
```

## Usage

```typescript
import { 
  ComponentRegistry, 
  RendererRegistry, 
  RendererOrchestrator,
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

// Create renderer orchestrator
const orchestrator = new RendererOrchestrator(registry);
```

## Documentation

For complete documentation, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

