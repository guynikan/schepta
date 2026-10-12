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

- **Default components sanitize what reaches the DOM.** Every default component of `@schepta/factory-react`, `@schepta/factory-vue` and `@schepta/factory-vanilla`, and the vanilla runtime adapter, pass schema props through an allowlist before applying them to a native element. HTML sinks (`innerHTML`, `dangerouslySetInnerHTML`, `srcdoc`), string event handlers, unsafe URL schemes, `data:` URLs outside raster image sources, and props outside the allowlist are dropped. Dropped props are reported with `console.warn`.
  - `action`/`formAction` accept relative URLs, and absolute URLs only when they resolve to the origin of the current document (`location.origin`). Without a document, as in server-side rendering, every absolute form target is dropped.
  - `target` accepts `_self`, `_blank`, `_parent` and `_top`. A `_blank` target always gets `rel="noopener noreferrer"` added.
  - `style` must be a plain object. A declaration with `url()`, `image-set()`, `image()`, `cross-fade()`, `element()`, `paint()`, `attr()`, `expression()`, any other function outside the allowlist, or a backslash is dropped; the other declarations of the same object are kept.
- **Default components render schema text as text.** Labels, option labels, placeholders and titles (`x-content`) go through the exported `toSafeText`, which returns a string or a finite number as text and an empty string for anything else.
- **Schema `children` are never rendered.** A `children` key in `x-component-props`, `x-ui` or any inherited prop bag is removed before a component is created. The only children a component receives are the ones rendered from schema `properties`.
- **Custom components receive schema props untouched.** Components you register (`x-component-props`, `x-content`, `externalContext`, `schema`, ...) are your code, so Schepta does not filter what they receive. If a custom component spreads schema props onto a native element, sanitize them first with the exported `sanitizeDOMProps`, passing the tag name of the element:

```tsx
import { sanitizeDOMProps } from '@schepta/core';

function Link({ children, 'x-component-props': xComponentProps, ...props }) {
  return <a {...sanitizeDOMProps({ ...xComponentProps, ...props }, 'a')}>{children}</a>;
}
```

The tag name selects the URL rules for that element (for example, raster `data:image/...` URLs are only accepted in image sources such as `<img src>`). Leave it out when the element is unknown and the strictest rules apply. Passing schema props to a UI-library component instead of a native element moves this responsibility to that component.

### Vue: never put a schema value in child position

Vue has no way to tell a real VNode from a look-alike: any object with `__v_isVNode: true` that reaches child position is mounted as an element, with its `props` applied. Schema JSON can contain such an object, for example as a `label`:

```json
{ "__v_isVNode": true, "type": "img", "props": { "src": "x", "onerror": "alert(1)" }, "shapeFlag": 1 }
```

Prop types do not help: `label: String` is not enforced in production builds. So a custom Vue component must not pass a schema value (`label`, `x-content`, option labels, helper or error text, anything from `x-component-props`) as a child or as slot content without converting it with `toSafeText`:

```ts
import { defineComponent, h } from 'vue';
import { toSafeText } from '@schepta/core';

export const Label = defineComponent({
  props: { label: null },
  setup(props) {
    // Not `h('label', props.label)`: an object there is mounted as an element.
    return () => h('label', toSafeText(props.label));
  },
});
```

The same goes for templates rendered with a dynamic component or a render function. Text interpolation in a template (`{{ label }}`) is safe, because it always produces text. In React and Vanilla the same values cannot inject markup, but an object in child position throws ("Objects are not valid as a React child") or prints `[object Object]`, so `toSafeText` is the right call there too.

## Documentation

For complete documentation, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

