/**
 * Default FormField Component for Vue
 *
 * Wrapper (grid cell) for a single form field.
 */

import { defineComponent, h, type PropType } from 'vue';

export const DefaultFormField = defineComponent({
  name: 'DefaultFormField',
  props: {
    'data-test-id': String,
    'x-component-props': Object as PropType<Record<string, any>>,
    'x-ui': Object as PropType<Record<string, any>>,
  },
  setup(props, { slots }) {
    return () => {
      const xProps = props['x-component-props'] || {};
      const { style, ...restXProps } = xProps;
      return h(
        'div',
        {
          style,
          'data-test-id': props['data-test-id'],
          ...restXProps,
        },
        slots.default?.()
      );
    };
  },
});
