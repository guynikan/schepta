<template>
  <v-card elevation="2" class="pa-4">
    <FormFactoryComponent />
  </v-card>
</template>

<script setup lang="ts">
import { createFormFactory } from '@spectra/factory-vue';
import { components } from '../components/InputComponents';
import simpleFormSchema from '../../../../tests/fixtures/simple-form.json';

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
  alert('Form submitted! Check console for values.');
};

const FormFactoryComponent = createFormFactory({
  schema: simpleFormSchema as any,
  components,
  onSubmit: handleSubmit,
  debug: true,
});
</script>

