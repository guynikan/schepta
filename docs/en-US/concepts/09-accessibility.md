# Accessibility

Schepta renders UI from JSON, so the schema author never writes the markup — the built-in components decide the semantics. That makes accessibility a framework responsibility rather than an application one: if a default component emits an unlabelled input, every app built on it inherits the problem.

The built-in React components target **WCAG 2.1 AA** out of the box. Nothing below requires configuration.

## What you get for free

### Every factory

- **Visible focus** — a `:focus-visible` ring is applied to interactive elements inside any Schepta subtree. Most defaults are unstyled buttons (`border: none`), where the browser ring is invisible or absent.
- **Reduced motion** — transitions and animations collapse under `prefers-reduced-motion: reduce`.
- **Collision-free ids** — ids come from React's `useId()`, so rendering the same schema twice on one page does not break `label[for]` or any `aria-*` reference.

Both style rules ship in the `schepta-defaults` CSS layer, injected by `createReactFactory`. Being in a layer means your own CSS overrides them without `!important`.

### FormFactory

| Behaviour | Detail |
| --- | --- |
| Label association | `<label for>` bound to a generated control id |
| Required fields | `required` + `aria-required` from `x-component-props.required` |
| Invalid fields | `aria-invalid` once the field fails validation |
| Error messages | Rendered alongside the control and linked via `aria-describedby` |
| Hint text | `x-component-props.description`, linked via `aria-describedby` |
| Error summary | Focused automatically on a failed submit, listing every error |
| Sections | `<section aria-labelledby>` naming itself from its `FormSectionTitle` |
| Native validation | Disabled (`noValidate`) so Schepta's announced messages are not pre-empted by browser bubbles |

Validation runs against the schema (AJV) on submit when `validateOnSubmit` is enabled. It is opt-in and defaults to `false`.

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "Email",
    "required": true,
    "description": "We use this to sign you in"
  }
}
```

That schema produces a labelled, required input whose hint and (after a failed submit) error are both announced.

### TabsFactory

Follows the ARIA Tabs pattern. The tab list is a **single tab stop**; arrow keys move between tabs, `Home` / `End` jump to the ends, and disabled tabs are skipped. Every trigger's `aria-controls` points at the panel element that is actually in the DOM.

Disabled tabs use `aria-disabled`, not the native `disabled` attribute — a natively disabled button is removed from the accessibility tree, so a screen reader user would not know the tab exists.

### ModalFactory

- Focus moves into the dialog on open and **returns to the element that opened it** on close.
- `Tab` and `Shift+Tab` cycle inside the dialog; `Escape` closes the focused dialog.
- Rendered through a portal to `document.body`, so it never inherits an ancestor's `aria-hidden` or stacking context.
- Names itself from the `ModalHeader` title (`aria-labelledby`) and its description (`aria-describedby`), falling back to `ariaLabel`.
- Body scroll is locked while open.

### TableFactory

- With selection enabled the table becomes `role="grid"` with `aria-multiselectable` — `aria-selected` on a row is invalid in a plain `table`.
- Rows use a roving tab stop: one `Tab` press enters the grid, arrows move between rows. Without this a 50-row table costs 50 presses to skip.
- Loading and empty states are announced through a live region.
- Sortable headers keep `aria-sort` and `<th scope="col">`.

### MenuFactory

- The active item carries `aria-current="page"`.
- Disabled items leave the tab order, instead of only being unclickable.

### LayoutFactory

- A skip link is rendered as the first focusable element, targeting `#main-content`.
- `<main>` is focusable (`tabindex="-1"`) so following the skip link moves focus, not just scroll.
- `banner` / `contentinfo` are claimed **only** when `isPageRoot: true`. A `<header>` nested inside a `<div>` is not a landmark, and a page with two banners is worse than one with none.

## Overriding the defaults

`x-component-props` accepts any prop and is spread onto the element last, so anything you set there wins over the generated value:

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "Search",
    "aria-label": "Search across all projects",
    "aria-keyshortcuts": "Control+K"
  }
}
```

Use this when you need a specific accessible name, a shortcut hint, or an ARIA attribute Schepta does not emit. Prefer the built-in behaviour where it exists — a hand-written `aria-describedby` will not update when validation state changes.

## Custom components

A custom component replaces the built-in wholesale, including its accessibility. The same primitives the defaults use are exported so you do not have to rebuild them:

```tsx
import {
  useFieldA11y,
  FieldMessages,
  type InputTextProps,
} from '@schepta/factory-react';

export function MyInput({ name, label, description, required, ...rest }: InputTextProps) {
  const { ids, errorText, labelProps, controlProps } = useFieldA11y({
    name,
    description,
    required,
  });

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input name={name} {...controlProps} {...rest} />
      <FieldMessages ids={ids} description={description} errorText={errorText} />
    </div>
  );
}
```

`useFieldA11y` reads the field's error reactively from the form adapter and returns the matching `aria-invalid` / `aria-describedby`, so your component announces validation the same way the defaults do.

Also available:

| Export | Use |
| --- | --- |
| `useA11yIds` | Collision-free ids for one component instance |
| `composeDescribedBy` | Joins `aria-describedby` candidates, dropping empties |
| `useRovingTabIndex` | Arrow-key navigation with one tab stop |
| `useFocusTrap` | Focus confinement + restoration for dialogs |
| `useAnnouncer` | Live region for asynchronous state changes |
| `visuallyHiddenStyle` | Hide visually while keeping it in the accessibility tree |

## Testing

The repository gates accessibility in CI at two levels:

- **Unit** — `vitest-axe` runs axe against each factory's output, plus explicit keyboard tests (`packages/factories/react/src/a11y/a11y.test.tsx`).
- **E2E** — `@axe-core/playwright` scans every showcase in a real browser and exercises the keyboard paths (`tests/e2e/a11y.spec.ts`, project `a11y`).

```bash
pnpm --filter @schepta/factory-react test
pnpm test:e2e -- --project=a11y
```

axe cannot tell whether arrow keys move between tabs or whether focus is trapped in a dialog. Those are the failures that actually lock a keyboard user out, so both suites pair static scanning with explicit interaction tests.

## Current limitations

- Vue and Vanilla defaults have **not** received this work yet. Only `@schepta/factory-react` meets the contract described here.
- Colour contrast is guaranteed for the default tokens only. If you override `--schepta-*`, verify the result stays at 4.5:1.
