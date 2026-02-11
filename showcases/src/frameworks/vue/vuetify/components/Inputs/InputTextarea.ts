/**
 * Vuetify InputTextarea Component
 */

import { defineComponent, h, type PropType } from 'vue';
import { VTextarea } from 'vuetify/components';

export const InputTextarea = defineComponent({
  name: 'VuetifyInputTextarea',
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: String,
    rows: { type: Number, default: 4 },
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
      return h(VTextarea, {
        modelValue: String(value),
        name: props.name,
        label: props.label,
        placeholder: props.placeholder,
        rows: props.rows,
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
