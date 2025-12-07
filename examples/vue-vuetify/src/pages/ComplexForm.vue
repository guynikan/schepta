<template>
  <v-card elevation="2" class="pa-4">
    <FormFactoryComponent />
  </v-card>
</template>

<script setup lang="ts">
import { createFormFactory } from '@schepta/factory-vue';
import { components } from '../components/InputComponents';
import complexFormSchema from '../../../../tests/fixtures/complex-form.json';

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
  alert('Form submitted! Check console for values.');
};

const FormFactoryComponent = createFormFactory({
  schema: complexFormSchema as any,
  components,
  onSubmit: handleSubmit,
  debug: true,
});
</script>

