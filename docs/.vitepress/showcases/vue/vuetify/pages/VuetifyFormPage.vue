<template>
  <div style="background: var(--schepta-bg); border-radius: 8px; margin: 1rem 0;border: 1px solid var(--schepta-border);">
    <v-card>
      <v-tabs v-model="activeTab">
        <v-tab value="simple">SIMPLE FORM</v-tab>
        <v-tab value="complex">COMPLEX FORM</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <v-window-item value="simple">
            <VuetifyForm :schema="simpleSchema" />
          </v-window-item>

          <v-window-item value="complex">
            <VuetifyForm :schema="complexSchema" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VuetifyForm from '../components/Form.vue';
import simpleFormSchema from '../../../../../../instances/form/simple-form.json';
import complexFormSchema from '../../../../../../instances/form/complex-form.json';
import type { FormSchema } from '@schepta/core';

const activeTab = ref('simple');

const simpleSchema = simpleFormSchema as FormSchema;
const complexSchema = complexFormSchema as FormSchema;
</script>
