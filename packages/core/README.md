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

Template expressions are checked when schemas are rendered. Diagnostics are a
side channel: by default they never change what an expression evaluates to, so
turning them on cannot hide, show, enable or disable a field. The value is
computed first, exactly as before, and problems are reported alongside it.

What is reported:

| Problem | Code | Strict mode |
| --- | --- | --- |
| Syntax or evaluation error | `EXPRESSION_EVALUATION_ERROR` | throws |
| Unknown root variable, such as `$session` or a bare word | `UNKNOWN_EXPRESSION_VARIABLE` | throws |
| `$formValues` path that has no value and is not declared by the schema | `EXPRESSION_PATH_NOT_FOUND` | throws |
| `$externalContext` path whose first-level key is missing | `EXPRESSION_PATH_NOT_FOUND` | throws |
| Missing path below an existing `$externalContext` key | `EXPRESSION_PATH_NOT_FOUND` | warns only |
| Path through `__proto__`, `prototype` or `constructor` | `EXPRESSION_PATH_NOT_FOUND` | throws |

A path has a value when reading it yields anything other than `undefined`.
Declared form fields that have not been filled in yet stay quiet, and so do
paths below them and the groups that contain them. External context has no
schema, so a missing path below a key that exists (`$externalContext.user.isAdmin`
when `user` is there) is treated as optional or still-loading data: it warns
and never throws. Roots handled by `createCustomResolver` (`$i18n`, `$now`) are
known. Forbidden segments are the one case where the value is forced to
`undefined`.

A missing value is expected, and not reported, on the left of `||` or `&&` and
in a comparison with `null` or `undefined`. `a && a.b` also covers `a.b`. A
ternary test is checked like any other operand. Unknown roots are always
reported.

```json
{ "visible": "{{ $externalContext.locale || 'en' }}" }
```

By default each problem is sent once per form to `onExpressionError`, to the
debug context, and to `console.warn` outside production. To make schema errors
fail fast, use strict handling on a provider or a factory:

```ts
const expressions = { onError: 'throw' as const };

// Provider: <ScheptaProvider expressions={expressions} />
// Factory:  <FormFactory expressions={expressions} schema={schema} />
```

Strict mode throws `ScheptaExpressionError` every time a non-warning problem is
met. Its `code`, `expression`, `path` and optional `missingPath` match what
`onExpressionError` receives. The handler can be an inline function: the form
keeps its record of what it already reported across re-renders.

### Expressions that are now evaluated

Expressions are evaluated with JEXL when they contain a comparison or logical
operator, and read as a property path otherwise. That rule is unchanged, so
keys such as `$externalContext.api-url` or `$externalContext.a/b` keep
resolving. What changed is the fallback: an expression that is not a readable
path used to resolve to `undefined` and is now evaluated.

| Expression | Before | Now |
| --- | --- | --- |
| `{{ $formValues.price * 2 }}`, `{{ $formValues.price - 1 }}` | `undefined` | the result |
| `{{ !$formValues.flag }}` | `undefined` | `true` / `false` |
| `{{ $formValues.flag ? 'a' : 'b' }}` | `undefined` | `'a'` / `'b'` |
| `{{ $formValues.items[0].name }}`, `{{ $formValues['email'] }}` | `undefined` | the value |
| `{{ 'text' }}`, `{{ 1 + 2 }}`, `{{ true }}` | `undefined` | the literal or result |
| `Total: {{ $formValues.price * 2 }}` | `Total: ` | `Total: 6` |

Arithmetic on a value that is missing yields `NaN`, as in JavaScript. An
expression without whitespace that could be a key (`$externalContext.a/b`) is
only evaluated when every reference in it has a value, so a missing key never
becomes `NaN`.

### Reactions

`x-reactions` expressions use `$form` as their only root. Pass
`declaredFormPaths` (from `collectDeclaredFormPaths`) in the reaction context
to have undeclared `$form` paths treated as errors. Without it an empty field
cannot be told from a typo, so a missing `$form` path only warns.

## License

MIT

