# `@schepta/renderer-vue-vuetify`

Vue + Vuetify renderer for Schepta's shared semantic `UiSpec` contract. The renderer
validates against `semanticUiCatalog` before mounting and keeps the generative contract
independent of Vuetify-specific props.

```ts
import { createVuetify } from 'vuetify';
import { VueVuetifyUiSpecRenderer } from '@schepta/renderer-vue-vuetify';

app.use(createVuetify());
app.component('UiSpecRenderer', VueVuetifyUiSpecRenderer);
```

Supported components are `Page`, `Form`, `Stack`, `Text`, `TextInput`,
`Select`, `ChoiceGroup`, `Checkbox`, `Button` and `Alert`. State is accessed
only through `bindings`; actions are resolved through `actionHandlers` or the
renderer `action` event.
