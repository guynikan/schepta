/**
 * Vuetify FormField Container
 */

import { defineComponent, h } from 'vue';

export const FormField = defineComponent({
  name: 'VuetifyFormField',
  setup(props, { slots }) {
    return () => {
      return h(
        'div',
        {
          style: {
            marginBottom: '16px',
          },
        },
        slots.default?.()
      );
    };
  },
});
