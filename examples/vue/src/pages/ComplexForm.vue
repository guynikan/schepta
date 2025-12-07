<template>
  <div>
    <div style="border: 1px solid #ddd; padding: 24px; border-radius: 8px">
      <FormFactoryComponent
        :schema="schema"
        :components="components"
        :onSubmit="handleSubmit"
        :debug="true"
      />
    </div>

    <div v-if="submittedValues" class="results-panel">
      <h3>Valores Submetidos:</h3>
      <pre>{{ JSON.stringify(submittedValues, null, 2) }}</pre>
      <p class="note">
        💡 Os valores também estão disponíveis no console do navegador (F12)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createFormFactory } from '@schepta/factory-vue';
import { components } from '../components/InputComponents';
import complexFormSchema from '../../../../tests/fixtures/complex-form.json';

const submittedValues = ref<any>(null);

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
  submittedValues.value = values;
};

const FormFactoryComponent = createFormFactory({
  schema: complexFormSchema as any,
  components,
  onSubmit: handleSubmit,
  debug: true,
});
</script>

<style scoped>
.results-panel {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.results-panel h3 {
  margin-top: 0;
}

.results-panel pre {
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  font-size: 13px;
}

.note {
  margin-top: 12px;
  padding: 8px 12px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 13px;
  color: #1e40af;
}
</style>

