<template>
  <div
    style="
      border: 1px solid var(--schepta-border);
      padding: 24px;
      border-radius: 8px;
    "
  >
    <FormFactory
      :schema="schema"
      :initial-values="initialValues"
      :on-submit="handleSubmit"
      :debug="true"
    />
    <div
      v-if="submittedValues"
      style="
        margin-top: 24px;
        padding: 16px;
        background: var(--schepta-bg-soft);
        border: 1px solid var(--schepta-border);
        border-radius: 8px;
      "
    >
      <h3 style="margin-top: 0">Submitted Values:</h3>
      <pre
        style="
          background: var(--schepta-bg);
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          font-size: 13px;
        "
      >
        {{ JSON.stringify(submittedValues, null, 2) }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FormFactory } from '@schepta/factory-vue';
import { generateValidationSchema, type FormSchema } from '@schepta/core';

const props = defineProps<{
  schema: FormSchema;
  initialValues?: Record<string, any>;
}>();

const submittedValues = ref<Record<string, any> | null>(null);

const initialValues = computed(() => {
  const { initialValues: schemaInitialValues } = generateValidationSchema(props.schema);
  return { ...schemaInitialValues, ...props.initialValues };
});

const handleSubmit = (values: Record<string, any>) => {
  console.log('Form submitted:', values);
  submittedValues.value = values;
};
</script>
