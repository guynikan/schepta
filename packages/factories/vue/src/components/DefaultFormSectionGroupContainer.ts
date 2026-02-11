/**
 * Default FormSectionGroupContainer Component for Vue
 *
 * Container for FormSectionGroup(s).
 */

import { defineComponent, h } from 'vue';

export const DefaultFormSectionGroupContainer = defineComponent({
  name: 'DefaultFormSectionGroupContainer',
  setup(props, { slots }) {
    return () => h('div', null, slots.default?.());
  },
});
