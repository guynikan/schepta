/**
 * Default FormSectionContainer Component for Vue
 *
 * Container for a form section (title + groups).
 */

import { defineComponent, h } from 'vue';

export const DefaultFormSectionContainer = defineComponent({
  name: 'DefaultFormSectionContainer',
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          style: { marginBottom: '24px' },
        },
        slots.default?.()
      );
  },
});
