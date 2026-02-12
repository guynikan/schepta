<template>
  <div style="margin-bottom: 16px; grid-column: 1 / -1">
    <button
      type="button"
      data-test-id="social-name-toggle"
      :style="buttonStyle"
      @click="toggle"
    >
      {{ openSocialName ? `- Remove ${label}` : `+ Add ${label}` }}
    </button>
    <div v-if="openSocialName" style="margin-top: 8px; width: 49%">
      <label :style="labelStyle">{{ label }}</label>
      <input
        type="text"
        data-test-id="social-name-input"
        :placeholder="placeholder"
        :value="value"
        :style="inputStyle"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useScheptaFormAdapter } from '@schepta/factory-vue';

const props = defineProps<{
  name: string;
  schema: any;
  externalContext: {
    openSocialName: boolean;
    setOpenSocialName: (value: boolean) => void;
  };
}>();

const adapter = useScheptaFormAdapter();

const label = computed(() => props.schema?.['x-component-props']?.label || 'Social Name');
const placeholder = computed(() => props.schema?.['x-component-props']?.placeholder || '');

const openSocialName = computed({
  get: () => props.externalContext.openSocialName,
  set: (v) => props.externalContext.setOpenSocialName(v),
});

const value = computed(() => adapter.getValue(props.name));

const toggle = () => {
  props.externalContext.setOpenSocialName(!props.externalContext.openSocialName);
};

const onInput = (e: Event) => {
  adapter.setValue(props.name, (e.target as HTMLInputElement).value);
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  cursor: 'pointer',
  padding: 0,
  fontSize: '14px',
  fontWeight: 500,
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '14px',
  fontWeight: 500,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '14px',
};
</script>
