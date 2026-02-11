/**
 * Vuetify InputSelect Component
 */

import { defineComponent, h, type PropType } from 'vue';
import { VSelect } from 'vuetify/components';

export interface InputSelectOption {
  value: string;
  label: string;
}

export const InputSelect = defineComponent({
  name: 'VuetifyInputSelect',
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: String,
    options: { type: Array as PropType<InputSelectOption[]>, default: () => [] },
    'data-test-id': String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    externalContext: Object,
    'x-component-props': Object,
    'x-ui': Object,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const value = props.value ?? '';
      const items = (props.options || []).map(opt => ({
        title: opt.label,
        value: opt.value,
      }));
      
      return h(VSelect, {
        modelValue: String(value),
        name: props.name,
        label: props.label,
        placeholder: props.placeholder,
        items,
        required: props.required,
        disabled: props.disabled,
        'data-test-id': props['data-test-id'] ?? props.name,
        variant: 'outlined',
        density: 'comfortable',
        ...props['x-component-props'],
        'onUpdate:modelValue': (val: string) => {
          props.onChange?.(val);
          emit('update:modelValue', val);
        },
      });
    };
  },
});
