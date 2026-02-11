/**
 * Vuetify FormSectionGroupContainer Component
 */

import { defineComponent, h } from 'vue';

export const FormSectionGroupContainer = defineComponent({
  name: 'VuetifyFormSectionGroupContainer',
  setup(props, { slots }) {
    return () => {
      return h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          },
        },
        slots.default?.()
      );
    };
  },
});
