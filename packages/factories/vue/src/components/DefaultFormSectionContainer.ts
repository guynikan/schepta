/**
 * Default FormSectionContainer Component for Vue
 *
 * Container for a form section (title + groups).
 */

import { defineComponent, h, mergeProps } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

export const DefaultFormSectionContainer = defineComponent({
  name: 'DefaultFormSectionContainer',
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        mergeProps({ style: { marginBottom: '24px' } }, sanitizeDOMProps(attrs, 'div')),
        slots.default?.()
      );
  },
});
