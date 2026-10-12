/**
 * Default FormField Component for Vue
 *
 * Wrapper (grid cell) for a single form field.
 */

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

export const DefaultFormField = defineComponent({
  name: 'DefaultFormField',
  inheritAttrs: false,
  props: {
    'data-test-id': String,
    'x-component-props': Object as PropType<Record<string, any>>,
    'x-ui': Object as PropType<Record<string, any>>,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const xProps = sanitizeDOMProps(props['x-component-props'] || {}, 'div');
      const { style, ...restXProps } = xProps;
      return h(
        'div',
        mergeProps(
          { style, 'data-test-id': props['data-test-id'], ...restXProps },
          sanitizeDOMProps(attrs, 'div')
        ),
        slots.default?.()
      );
    };
  },
});
