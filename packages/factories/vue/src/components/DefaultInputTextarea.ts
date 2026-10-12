/**
 * Default InputTextarea Component for Vue
 *
 * Built-in textarea input for forms.
 */

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid var(--schepta-border)',
  borderRadius: '4px',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: '500',
};

const wrapperStyle = { marginBottom: '16px' };

export const DefaultInputTextarea = defineComponent({
  name: 'DefaultInputTextarea',
  inheritAttrs: false,
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    return () => {
      const value = props.value ?? '';
      return h('div', mergeProps({ style: wrapperStyle }, sanitizeDOMProps(attrs, 'div')), [
        props.label &&
          h('label', { for: props.name, style: labelStyle }, props.label),
        h('textarea', {
          id: props.name,
          name: props.name,
          value: String(value),
          placeholder: props.placeholder,
          rows: props.rows,
          required: props.required,
          disabled: props.disabled,
          'data-test-id': props['data-test-id'] ?? props.name,
          style: inputStyle,
          onInput: (e: Event) => {
            const val = (e.target as HTMLTextAreaElement).value;
            props.onChange?.(val);
            emit('update:modelValue', val);
          },
        }),
      ]);
    };
  },
});
