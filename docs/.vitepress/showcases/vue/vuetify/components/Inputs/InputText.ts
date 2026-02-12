/**
 * Vuetify InputText Component
 */

import { defineComponent, h, type PropType } from 'vue';
import { VTextField } from 'vuetify/components';

export const InputText = defineComponent({
  name: 'VuetifyInputText',
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: String,
    'data-test-id': String,
    type: { type: String, default: 'text' },
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
      return h(VTextField, {
        modelValue: String(value),
        name: props.name,
        label: props.label,
        placeholder: props.placeholder,
        type: props.type,
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
