/**
 * Default FormSectionGroup Component for Vue
 *
 * Grid layout for a group of form fields.
 */

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

export const DefaultFormSectionGroup = defineComponent({
  name: 'DefaultFormSectionGroup',
  inheritAttrs: false,
  props: {
    style: Object as PropType<Record<string, string>>,
    'x-component-props': Object as PropType<Record<string, any>>,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rawXProps = props['x-component-props'] || {};
      const xProps = sanitizeDOMProps(rawXProps, 'div');
      // `columns` ends up in a style declaration, so it goes through the style rules.
      const columns = rawXProps.columns === undefined
        ? undefined
        : sanitizeDOMProps({ style: { gridTemplateColumns: rawXProps.columns } }, 'div').style?.gridTemplateColumns;
      const baseStyle = {
        display: 'grid',
        gridTemplateColumns: columns || 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        ...sanitizeDOMProps({ style: props.style || {} }, 'div').style,
        ...xProps.style,
      };
      return h('div', mergeProps({ style: baseStyle }, sanitizeDOMProps(attrs, 'div')), slots.default?.());
    };
  },
});
