# Vue Vuetify Examples

Interactive examples of Spectra forms using Vue 3 with Vuetify Material Design components.

## Simple Form

A basic form with first name and last name fields using Vuetify components.

<CodeSandboxEmbed
  sandbox-id="spectra-vue-vuetify-simple"
  title="Vue Vuetify Simple Form Example"
  height="600px"
/>

### Schema

The same schema structure as the [Vue example](/examples/vue), but rendered with Vuetify components.

### Usage

```vue
<template>
  <v-card elevation="2" class="pa-4">
    <FormFactoryComponent />
  </v-card>
</template>

<script setup lang="ts">
import { createFormFactory } from '@spectra/factory-vue';
import { components } from './components/VuetifyInputComponents';
import simpleFormSchema from './fixtures/simple-form.json';

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
};

const FormFactoryComponent = createFormFactory({
  schema: simpleFormSchema,
  components,
  onSubmit: handleSubmit,
});
</script>
```

## Complex Form

A more complex form with multiple field types using Vuetify's Material Design components.

<CodeSandboxEmbed
  sandbox-id="spectra-vue-vuetify-complex"
  title="Vue Vuetify Complex Form Example"
  height="700px"
/>

### Features

- **Material Design**: Vuetify's Material Design components
- **Responsive Grid**: Vuetify's `VRow` and `VCol` for responsive layouts
- **Form Validation**: Integrated with Vuetify's validation system
- **Consistent Styling**: Material Design theme applied automatically

