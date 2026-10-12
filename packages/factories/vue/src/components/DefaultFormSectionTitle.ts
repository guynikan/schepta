/**
 * Default FormSectionTitle Component for Vue
 *
 * Section title (x-content).
 */

import { defineComponent, h, mergeProps } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

export const DefaultFormSectionTitle = defineComponent({
  name: 'DefaultFormSectionTitle',
  inheritAttrs: false,
  props: {
    // Vue camelizes prop keys, so the schema's `x-content` arrives as `xContent`.
    xContent: String,
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'h2',
        mergeProps(
          {
            style: {
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--schepta-text-1)',
            },
          },
          sanitizeDOMProps(attrs, 'h2')
        ),
        props.xContent ?? slots.default?.()
      );
  },
});
