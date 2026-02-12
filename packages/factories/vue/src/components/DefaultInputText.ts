/**
 * Default InputText Component for Vue
 *
 * Built-in text input for forms.
 */

import { defineComponent, h, type PropType } from 'vue';

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

export const DefaultInputText = defineComponent({
  name: 'DefaultInputText',
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const value = props.value ?? '';
      return h('div', { style: wrapperStyle }, [
        props.label &&
          h('label', { for: props.name, style: labelStyle }, props.label),
        h('input', {
          id: props.name,
          name: props.name,
          value: String(value),
          placeholder: props.placeholder,
          type: props.type,
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
