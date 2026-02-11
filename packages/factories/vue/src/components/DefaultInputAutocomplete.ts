/**
 * Default InputAutocomplete Component for Vue
 *
 * Built-in autocomplete input for forms (uses native datalist).
 */

import { defineComponent, h, type PropType } from 'vue';

export interface InputAutocompleteOption {
  value: string;
  label?: string;
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

function normalizeOptions(
  options: InputAutocompleteOption[] | string[] = []
): { value: string; label: string }[] {
  return options.map((opt) =>
    typeof opt === 'string'
      ? { value: opt, label: opt }
      : { value: opt.value, label: opt.label ?? opt.value }
  );
}

export const DefaultInputAutocomplete = defineComponent({
  name: 'DefaultInputAutocomplete',
  props: {
    name: { type: String, required: true },
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void> },
    label: String,
    placeholder: String,
    options: {
      type: Array as PropType<InputAutocompleteOption[] | string[]>,
      default: () => [],
    },
    'data-test-id': String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const listId = `${props.name}-datalist`;
      const normalizedOptions = normalizeOptions(props.options || []);
      const value = props.value ?? '';
      return h('div', { style: wrapperStyle }, [
        props.label &&
          h('label', { for: props.name, style: labelStyle }, props.label),
        h('input', {
          id: props.name,
          name: props.name,
          list: listId,
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
        h(
          'datalist',
          { id: listId },
          normalizedOptions.map((opt) =>
            h('option', { key: opt.value, value: opt.value }, opt.label)
          )
        ),
      ]);
    };
  },
});
