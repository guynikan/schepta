/**
 * Default InputCheckbox Component for Vue
 *
 * Built-in checkbox input for forms.
 */

import { defineComponent, h, type PropType } from 'vue';

const wrapperStyle = { marginBottom: '16px' };

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const DefaultInputCheckbox = defineComponent({
  name: 'DefaultInputCheckbox',
  props: {
    name: { type: String, required: true },
    value: { type: [Boolean, String] as PropType<boolean | string>, default: false },
    onChange: { type: Function as PropType<(v: boolean) => void> },
    label: String,
    'data-test-id': String,
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const checked = props.value === true || props.value === 'true';
      return h('div', { style: wrapperStyle }, [
        h(
          'label',
          { style: labelStyle },
          [
            h('input', {
              type: 'checkbox',
              name: props.name,
              checked,
              required: props.required,
              disabled: props.disabled,
              'data-test-id': props['data-test-id'] ?? props.name,
              onChange: (e: Event) => {
                const val = (e.target as HTMLInputElement).checked;
                props.onChange?.(val);
                emit('update:modelValue', val);
              },
            }),
            props.label,
          ]
        ),
      ]);
    };
  },
});
