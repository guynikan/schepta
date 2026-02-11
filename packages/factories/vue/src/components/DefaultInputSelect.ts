/**
 * Default InputSelect Component for Vue
 *
 * Built-in select input for forms.
 */

import { defineComponent, h, type PropType } from 'vue';

export interface InputSelectOption {
  value: string;
  label: string;
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: '500',
};

const wrapperStyle = { marginBottom: '16px' };

export const DefaultInputSelect = defineComponent({
  name: 'DefaultInputSelect',
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: { type: String, default: 'Select...' },
    options: { type: Array as PropType<InputSelectOption[]>, default: () => [] },
    'data-test-id': String,
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
        h(
          'select',
          {
            id: props.name,
            name: props.name,
            value: String(value),
            required: props.required,
            disabled: props.disabled,
            'data-test-id': props['data-test-id'] ?? props.name,
            style: inputStyle,
            onChange: (e: Event) => {
              const val = (e.target as HTMLSelectElement).value;
              props.onChange?.(val);
              emit('update:modelValue', val);
            },
          },
          [
            h('option', { value: '' }, props.placeholder),
            ...(props.options || []).map((opt) =>
              h('option', { key: opt.value, value: opt.value }, opt.label)
            ),
          ]
        ),
      ]);
    };
  },
});
