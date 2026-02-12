/**
 * Vuetify FormSectionGroup Component
 */

import { defineComponent, h } from 'vue';

export const FormSectionGroup = defineComponent({
  name: 'VuetifyFormSectionGroup',
  setup(props, { slots }) {
    return () => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          },
        },
        slots.default?.()
      );
    };
  },
});
