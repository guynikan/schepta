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

## Security: untrusted schemas

Treat schema JSON as untrusted input: it often comes from an API, a CMS or a database, so anything in it can be attacker-controlled.

- **Default components sanitize what reaches the DOM.** Every default component of `@schepta/factory-react`, `@schepta/factory-vue` and `@schepta/factory-vanilla`, and the vanilla runtime adapter, pass schema props through an allowlist before applying them to a native element. HTML sinks (`innerHTML`, `dangerouslySetInnerHTML`, `srcdoc`), string event handlers, unsafe URL schemes, `data:` URLs outside raster image sources, cross-origin `action`/`formAction`, and CSS values with `url()` or escapes are dropped. Dropped props are reported with `console.warn`.
- **Custom components receive schema props untouched.** Components you register (`x-component-props`, `x-content`, `externalContext`, `schema`, ...) are your code, so Schepta does not filter what they receive. If a custom component spreads schema props onto a native element, sanitize them first with the exported `sanitizeDOMProps`, passing the tag name of the element:

```tsx
import { sanitizeDOMProps } from '@schepta/core';

function Link({ children, 'x-component-props': xComponentProps, ...props }) {
  return <a {...sanitizeDOMProps({ ...xComponentProps, ...props }, 'a')}>{children}</a>;
}
```

The tag name selects the URL rules for that element (for example, raster `data:image/...` URLs are only accepted in image sources such as `<img src>`). Leave it out when the element is unknown and the strictest rules apply. Passing schema props to a UI-library component instead of a native element moves this responsibility to that component.

## Documentation

For complete documentation, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

