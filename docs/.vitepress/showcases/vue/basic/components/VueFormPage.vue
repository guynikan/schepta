<template>
  <div style="background: var(--schepta-bg); border-radius: 8px; margin: 1rem 0;border: 1px solid var(--schepta-border);">
    <div style="background: var(--schepta-bg); padding: 1.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div class="tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === index }]"
          :data-test-id="tab.testId"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 0" style="padding: 1rem 0;">
          <NativeForm :schema="simpleSchema" />
        </div>

        <div v-if="activeTab === 1" style="padding: 1rem 0;">
          <NativeComplexForm :schema="complexSchema" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NativeForm from './NativeForm.vue';
import NativeComplexForm from './NativeComplexForm.vue';
import simpleFormSchema from '../../../../../../instances/form/simple-form.json';
import complexFormSchema from '../../../../../../instances/form/complex-form.json';
import type { FormSchema } from '@schepta/core';

const activeTab = ref(0);

const simpleSchema = simpleFormSchema as FormSchema;
const complexSchema = complexFormSchema as FormSchema;

const tabs = [
  { id: 'simple', label: 'Simple Form', testId: 'simple-form-tab' },
  { id: 'complex', label: 'Complex Form', testId: 'complex-form-tab' },
];
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--schepta-border);
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab {
  color: var(--schepta-text-2);
}

.tab.active {
  border-bottom-color: var(--schepta-brand);
  color: var(--schepta-brand);
}

.tab-content {
  padding: 1rem 0;
}

h3 {
  margin-bottom: 0.5rem;
  color: var(--schepta-text-1);
}
</style>
