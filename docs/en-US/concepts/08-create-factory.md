# Creating a Factory

**Schepta exposes a generic factory primitive** so you can ship your own built-in factories (`FormFactory`, `MenuFactory`, and whatever you invent next) on top of the same engine.

The primitive takes care of the boring parts — schema validation, config merging, orchestrator setup, imperative refs, reactive state — and lets you focus on the domain logic of your factory.

## When to Build a Custom Factory

Create a factory when you need:

- A dedicated **schema shape** (forms, menus, steppers, dashboards, canvases…) with its own JSON Schema definition.
- A **set of default components** the schema will resolve to.
- A **domain lifecycle** (state, events, imperative API) wrapped around the render tree.

If you only need a different look-and-feel, you don't need a new factory — you can register components via the `ScheptaProvider` or pass them as `components` props to an existing factory.

## The Primitive

Each runtime exports a factory primitive:

| Runtime   | Import                                                | Returns                              |
| --------- | ----------------------------------------------------- | ------------------------------------ |
| React     | `import { createReactFactory } from '@schepta/factory-react'`     | `forwardRef` component               |
| Vue       | `import { createVueFactory } from '@schepta/factory-vue'`         | `defineComponent` result             |
| Vanilla JS| `import { createVanillaFactory } from '@schepta/factory-vanilla'` | Factory function returning an API    |

They share the same mental model:

1. Declare a `schemaDefinition` (JSON Schema) the factory will validate against.
2. Declare a `rootComponentKey` (the `x-component` of the root node).
3. Provide `defaultComponents` and optional `defaultRenderers`.
4. Implement a `useSetup` (or `setup`) callback that returns state, optional `refApi`, extra middlewares, and an optional `wrap` to decorate the rendered tree.

## React Example — A Minimal `MenuFactory`

```tsx
import { createReactFactory } from '@schepta/factory-react';
import { useState, useMemo, useCallback } from 'react';
import menuSchemaDefinition from '@schepta/factories/schemas/menu-schema.json';
import { defaultMenuComponents } from './menu-defaults';

export interface MenuFactoryRef {
  getActiveItem: () => string | null;
  setActiveItem: (key: string | null) => void;
}

export const MenuFactory = createReactFactory<
  { schema: any; initialActiveItem?: string | null; onSelect?: (p: any) => void },
  MenuFactoryRef
>({
  displayName: 'MenuFactory',
  schemaDefinition: menuSchemaDefinition,
  rootComponentKey: 'MenuContainer',
  defaultComponents: defaultMenuComponents,
  useSetup: ({ props }) => {
    const [activeItem, setActiveItem] = useState(props.initialActiveItem ?? null);

    const onSelect = useCallback(
      (payload: { href?: string; label: string }, key: string) => {
        setActiveItem(key);
        props.onSelect?.({ key, ...payload });
      },
      [props.onSelect]
    );

    return {
      state: { activeItem },
      externalContext: { menu: { activeItem, onSelect } },
      refApi: {
        getActiveItem: () => activeItem,
        setActiveItem,
      },
    };
  },
});
```

Usage:

```tsx
<MenuFactory
  schema={menuSchema}
  onSelect={(payload) => console.log('selected', payload)}
/>
```

## What `useSetup` Can Return

`useSetup` receives `{ props, mergedConfig }` and can return any subset of:

| Field              | Purpose                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `state`            | State object the orchestrator re-renders on (used with `subscribe`/`getSnapshot`).              |
| `subscribe`        | (React) `useSyncExternalStore` subscribe fn. Use for external stores (form adapters, etc.).    |
| `getSnapshot`      | (React) Matching snapshot fn. Returned value is used as `state`.                                |
| `middlewares`      | Extra middleware fns appended to the pipeline.                                                  |
| `externalContext`  | Extra entries merged into the renderer's external context.                                      |
| `formAdapter`      | Optional form adapter for factories that need form semantics.                                   |
| `onSubmit`         | Optional submit handler piped through the orchestrator.                                         |
| `refApi`           | Object exposed via `useImperativeHandle` / ref API.                                             |
| `wrap`             | `(tree) => ReactNode` — wrap the orchestrator's tree (e.g. with `<ScheptaFormProvider>`).      |

Only return what you need — everything is optional except the fact that a React factory must return an object.

## Lower-Level Hooks (React)

`createReactFactory` is itself a thin composition of three reusable hooks you can call directly if you want full control:

- `useScheptaSchemaValidation(instance, { schemaDefinition })` — runs AJV validation and returns `{ valid, errors, formattedErrors }`.
- `useMergedScheptaConfig({ defaultComponents, defaultRenderers, components, ... })` — merges factory defaults, provider config, and local props.
- `useScheptaOrchestrator({ components, renderers, rootComponentKey, ... })` — builds the Schepta orchestrator renderer.

They are exported from `@schepta/factory-react` for advanced/experimental cases. For 95% of factories, `createReactFactory` is the right abstraction.

## Vue & Vanilla

The Vue and Vanilla primitives follow the same contract:

- `createVueFactory` returns a `defineComponent` you can register anywhere Vue components go. `setup` receives props and merged config and returns the same shape described above (minus React-specific hooks).
- `createVanillaFactory` returns a `(mountNode, options) => api` function. The factory handles the mount/re-render loop, focus preservation, and validation error UI. `onBeforeRerender` / `onAfterRerender` hooks let you preserve DOM state across re-renders.

## Coexistence

Multiple factories can coexist under the same `ScheptaProvider`. Each factory keeps its own `defaultComponents` and `rootComponentKey`, so there is no global registry clash — `FormFactory` and a custom `MenuFactory` can render side-by-side with no extra configuration.

```tsx
<ScheptaProvider>
  <MenuFactory schema={menuSchema} />
  <FormFactory schema={formSchema} onSubmit={save} />
</ScheptaProvider>
```

## Checklist

- [ ] A JSON Schema definition validated by AJV (published or bundled with the factory).
- [ ] A `rootComponentKey` matching the root `x-component` of that schema.
- [ ] A `defaultComponents` map (and optional `defaultRenderers`).
- [ ] A `useSetup` / `setup` with the domain-specific state and ref API.
- [ ] Tests covering schema validation failure, successful render, and the public ref API.
