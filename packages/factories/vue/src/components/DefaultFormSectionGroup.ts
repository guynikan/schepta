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
    // The renderer merges `x-component-props` into the props, so `columns`
    // arrives as a prop of its own.
    columns: [String, Number] as PropType<string | number>,
    // Vue camelizes prop keys, so `x-component-props` arrives as `xComponentProps`.
    xComponentProps: Object as PropType<Record<string, any>>,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const rawXProps = props.xComponentProps || {};
      const xProps = sanitizeDOMProps(rawXProps, 'div');
      const rawColumns = props.columns ?? rawXProps.columns;
      // `columns` ends up in a style declaration, so it goes through the style rules.
      const columns = rawColumns === undefined
        ? undefined
        : sanitizeDOMProps({ style: { gridTemplateColumns: rawColumns } }, 'div').style?.gridTemplateColumns;
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
