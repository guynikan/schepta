<template>
  <div>
    <v-card elevation="2" class="pa-4">
      <FormFactoryComponent />
    </v-card>

    <v-card v-if="submittedValues" elevation="2" class="pa-4 mt-4">
      <h3 class="mb-3">Valores Submetidos:</h3>
      <v-card variant="outlined" class="pa-3">
        <pre style="margin: 0; font-size: 13px; overflow: auto;">{{ JSON.stringify(submittedValues, null, 2) }}</pre>
      </v-card>
      <v-alert type="info" variant="tonal" class="mt-3" density="compact">
        💡 Os valores também estão disponíveis no console do navegador (F12)
      </v-alert>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createFormFactory } from '@schepta/factory-vue';
import { components } from '../components/InputComponents';
import simpleFormSchema from '../../../../tests/fixtures/simple-form.json';

const submittedValues = ref<any>(null);

const handleSubmit = (values: any) => {
  console.log('Form submitted:', values);
  submittedValues.value = values;
};

const FormFactoryComponent = createFormFactory({
  schema: simpleFormSchema as any,
  components,
  onSubmit: handleSubmit,
  debug: true,
});
</script>

