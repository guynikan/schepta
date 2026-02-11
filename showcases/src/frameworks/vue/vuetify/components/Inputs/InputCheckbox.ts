/**
 * Vuetify InputCheckbox Component
 */

import { defineComponent, h, type PropType } from 'vue';
import { VCheckbox } from 'vuetify/components';

export const InputCheckbox = defineComponent({
  name: 'VuetifyInputCheckbox',
  props: {
    name: { type: String, required: true },
    value: { type: [Boolean, String] as PropType<boolean | string>, default: false },
    onChange: { type: Function as PropType<(v: boolean) => void> },
    label: String,
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
      const checked = props.value === true || props.value === 'true';
      return h(VCheckbox, {
        modelValue: checked,
        name: props.name,
        label: props.label,
        required: props.required,
        disabled: props.disabled,
        'data-test-id': props['data-test-id'] ?? props.name,
        density: 'comfortable',
        ...props['x-component-props'],
        'onUpdate:modelValue': (val: boolean) => {
          props.onChange?.(val);
          emit('update:modelValue', val);
        },
      });
    };
  },
});
