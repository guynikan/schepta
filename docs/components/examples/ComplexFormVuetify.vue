<template>
  <div class="example-container">
    <FormFactoryComponent />
  </div>
</template>

<script setup lang="ts">
import { createFormFactory } from '@schepta/factory-vue';
import { components } from './VuetifyInputComponents';
import complexFormSchema from '../../fixtures/complex-form.json';

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
  alert('Form submitted! Check console for values.');
};

const FormFactoryComponent = createFormFactory({
  schema: complexFormSchema as any,
  components,
  onSubmit: handleSubmit,
  debug: false,
});
</script>

<style scoped>
.example-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  background: white;
}
</style>
