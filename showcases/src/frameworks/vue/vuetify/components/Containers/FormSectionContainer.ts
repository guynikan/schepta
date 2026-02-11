/**
 * Vuetify FormSectionContainer Component
 */

import { defineComponent, h } from 'vue';
import { VCard, VCardText } from 'vuetify/components';

export const FormSectionContainer = defineComponent({
  name: 'VuetifyFormSectionContainer',
  setup(props, { slots }) {
    return () => {
      return h(
        VCard,
        {
          variant: 'outlined',
          style: { marginBottom: '24px' },
        },
        () => h(VCardText, {}, slots.default)
      );
    };
  },
});
