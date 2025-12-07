# @schepta/factory-vue

Vue factory for Spectra. Provides `FormFactory` component for rendering forms from JSON schemas in Vue 3 applications.

## Installation

```bash
npm install @schepta/factory-vue @schepta/core @schepta/adapter-vue vue
```

## Peer Dependencies

- `vue` >= 3.0.0

## Usage

```vue
<template>
  <FormFactoryComponent
    :schema="formSchema"
    :components="components"
    :on-submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { createFormFactory } from '@schepta/factory-vue';
import { createComponentSpec } from '@schepta/core';

const FormFactoryComponent = createFormFactory({
  // configuration
});

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
};
</script>
```

## Documentation

For complete documentation and examples, visit [https://schepta.dev](https://schepta.dev)

## License

MIT

