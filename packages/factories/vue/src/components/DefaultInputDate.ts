/**
 * Default InputDate Component for Vue
 *
 * Built-in date input for forms.
 */

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { sanitizeDOMProps, toSafeText } from '@schepta/core';

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--schepta-border)',
  borderRadius: '4px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: '500',
};

const wrapperStyle = { marginBottom: '16px' };

export const DefaultInputDate = defineComponent({
  name: 'DefaultInputDate',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: String,
    'data-test-id': String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    return () => {
      const value = props.value ?? '';
      const label = toSafeText(props.label);
      return h('div', mergeProps({ style: wrapperStyle }, sanitizeDOMProps(attrs, 'div')), [
        label &&
          h('label', { for: props.name, style: labelStyle }, label),
        h('input', {
          type: 'date',
          id: props.name,
          name: props.name,
          value: String(value),
          placeholder: props.placeholder,
          required: props.required,
          disabled: props.disabled,
          'data-test-id': props['data-test-id'] ?? props.name,
          style: inputStyle,
          onInput: (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            props.onChange?.(val);
            emit('update:modelValue', val);
          },
        }),
      ]);
    };
  },
});
