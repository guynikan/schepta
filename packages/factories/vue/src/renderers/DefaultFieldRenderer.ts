/**
 * Default Field Renderer Component for Vue
 *
 * Renders field components with native Schepta form adapter binding.
 */

import { defineComponent, h, computed, type PropType } from 'vue';
import { useScheptaFormAdapter, useScheptaFormValues } from '../context/schepta-form-context';
import type { FieldRendererProps } from '@schepta/core';

/**
 * Default field renderer - uses native Schepta form adapter.
 */
export const DefaultFieldRenderer = defineComponent({
  name: 'DefaultFieldRenderer',
  props: {
    name: { type: String, required: true },
    component: { type: [Object, Function] as PropType<any>, required: true },
    componentProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    children: [Array, Object, String],
  },
  setup(props) {
    const adapter = useScheptaFormAdapter();
    const formValues = useScheptaFormValues();

    const value = computed(() => {
      const parts = props.name.split('.');
      let current: any = formValues;
      for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
      }
      return current;
    });

    const handleChange = (newValue: any) => {
      adapter.setValue(props.name, newValue);
    };

    return () => {
      const Component = props.component;
      const displayValue =
        value.value !== undefined && value.value !== null
          ? value.value
          : (props.componentProps?.value ?? '');
      return h(Component, {
        ...props.componentProps,
        name: props.name,
        value: displayValue,
        modelValue: displayValue,
        onChange: handleChange,
        'onUpdate:modelValue': handleChange,
      });
    };
  },
});
