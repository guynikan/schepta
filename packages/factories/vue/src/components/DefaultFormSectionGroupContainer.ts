/**
 * Default FormSectionGroupContainer Component for Vue
 *
 * Container for FormSectionGroup(s).
 */

import { defineComponent, h, mergeProps } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

export const DefaultFormSectionGroupContainer = defineComponent({
  name: 'DefaultFormSectionGroupContainer',
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    return () => h('div', sanitizeDOMProps(attrs, 'div'), slots.default?.());
  },
});
