# Props Transformation

**System that intercepts and modifies props before rendering** — the "intelligent filter" between schema and component.

<img src="/images/06-middleware.svg" alt="Middleware" />

**Middleware Pipeline allows modifying component behavior without changing code:**

### What It Does:

| **Input** | **Middleware** | **Transformation** | **Output** |
| --------- | -------------- | ------------------ | ---------- |
| Raw props from schema | Template expression middleware | Replaces `{{ $formValues.x }}`, `{{ $externalContext.x }}` | Resolved props |
| Props + schema + context | Custom middleware | Validation, formatting, logic | Final props |
| Component props | Your middleware | Any transformation | Enhanced props |

### Pipeline Flow:

**Sequential Execution (array order):**
```text
Raw Props → Middleware 1 → Middleware 2 → ... → Final Props → Component
```

**Built-in:** The template expression middleware runs first (when using FormFactory), so form values and external context are available for substitution. Then any middlewares you pass (Provider `middlewares` and factory `middlewares`) run in order.

> **Result:** Basic props → Enriched props. Functionality without duplicated code!


## Middleware Interface

**Signature (from `@schepta/core`):**

```typescript
import type { MiddlewareFn, MiddlewareContext } from '@schepta/core';

const myMiddleware: MiddlewareFn = (props, schema, context) => {
  // props: current props object
  // schema: the schema node for this component
  // context: MiddlewareContext
  return { ...props, /* your changes */ };
};
```

**MiddlewareContext** provides:
- `formValues` — current form values (for form-aware middleware)
- `externalContext` — Provider `externalContext` (user, API, etc.)
- `debug` — debug utilities when debug is enabled
- `formAdapter` — form adapter when available (e.g. in FormFactory)

**Registration:** Middlewares are passed as an **array**, not an object. Order of execution is the order in the array.

```typescript
<ScheptaProvider middlewares={[templateMiddleware, withValidation, withAnalytics]}>
  ...
</ScheptaProvider>

// Or per factory
<FormFactory schema={schema} middlewares={[customMiddleware]} />
```

The pipeline applies middlewares in sequence; each receives the result of the previous. Use `applyMiddlewares` from core if you need to run the same pipeline elsewhere.


## Middleware Patterns

**Transformation patterns:**

| **Pattern** | **Purpose** | **Implementation** |
| ----------- | ----------- | ------------------ |
| **Enhancer** | Add functionality | `(props, schema, context) => ({ ...props, newFeature })` |
| **Filter** | Remove/modify props | `(props) => omit(props, 'sensitiveData')` |
| **Mapper** | Transform values | `(props) => ({ ...props, value: transform(props.value) })` |
| **Conditional** | Apply conditionally | `(props, schema, context) => condition ? enhance(props) : props` |

**Example – logging wrapper:**
```typescript
const withLogging = (next: MiddlewareFn): MiddlewareFn => (props, schema, context) => {
  if (context.debug?.isEnabled) {
    context.debug.log('middleware', 'Before', props);
  }
  const result = next(props, schema, context);
  if (context.debug?.isEnabled) {
    context.debug.log('middleware', 'After', result);
  }
  return result;
};
```


## Related Concepts

**Middleware Pipeline is the "props processor" used by other concepts:**

- **[01. Factories](./01-factories.md):** Factories execute the middleware pipeline for each component
- **[04. Schema Resolution](./04-schema-resolution.md):** Resolution applies middleware during processing  
- **[05. Renderer](./05-renderer.md):** Renderers receive props after middleware
- **[02. Schema Language](./02-schema-language.md):** Schema properties (e.g. `x-component-props`) are transformed by middleware
- **[03. Provider](./03-provider.md):** Provider registers global `middlewares` array
- **[07. Debug System](./07-debug-system.md):** Debug can log middleware execution when enabled
