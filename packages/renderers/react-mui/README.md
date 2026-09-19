# @schepta/renderer-react-mui

Material UI renderer for the framework-independent semantic `UiSpec` contract.
The renderer accepts JSON-compatible specs and maps the semantic catalog to a
small, stable set of Material UI components without allowing Material UI props
to leak into the spec.

```tsx
import { UiSpecRenderer } from '@schepta/renderer-react-mui';

<UiSpecRenderer
  spec={onboardingSpec}
  onAction={({ action, state }) => submit(action, state)}
  onStateChange={(state) => saveDraft(state)}
/>
```

The renderer supports `Page`, `Form`, `Stack`, `Text`, `TextInput`, `Select`,
`ChoiceGroup`, `Checkbox`, `Button` and `Alert`, including bindings, action
invocations, input messages and loading/error/success status messages.
