/**
 * Default FormSectionGroup Component for Vue
 *
 * Grid layout for a group of form fields.
 */

import { defineComponent, h, type PropType } from 'vue';

export const DefaultFormSectionGroup = defineComponent({
  name: 'DefaultFormSectionGroup',
  props: {
    style: Object as PropType<Record<string, string>>,
    'x-component-props': Object as PropType<Record<string, any>>,
  },
  setup(props, { slots }) {
    return () => {
      const xProps = props['x-component-props'] || {};
      const baseStyle = {
        display: 'grid',
        gridTemplateColumns: xProps.columns || 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        ...props.style,
        ...xProps.style,
      };
      return h('div', { style: baseStyle }, slots.default?.());
    };
  },
});
