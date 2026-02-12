<template>
  <div>
    <FormFactory
      :schema="schema"
      :components="customComponents"
      @submit="handleSubmit"
    />

    <div v-if="submittedValues" style="margin-top: 2rem; padding: 1rem; background: #e3f2fd; border-radius: 4px;">
      <h3 style="margin-bottom: 0.5rem; color: #1976d2;">Submitted Values:</h3>
      <pre style="background: white; padding: 1rem; border-radius: 4px; overflow: auto;">{{ JSON.stringify(submittedValues, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormFactory } from '@schepta/factory-vue';
import { components as customComponents } from './ComponentRegistry';
import type { FormSchema } from '@schepta/core';

defineProps<{
  schema: FormSchema;
}>();

const submittedValues = ref<Record<string, any> | null>(null);

const handleSubmit = (values: Record<string, any>) => {
  console.log('Form submitted:', values);
  submittedValues.value = values;
};
</script>
