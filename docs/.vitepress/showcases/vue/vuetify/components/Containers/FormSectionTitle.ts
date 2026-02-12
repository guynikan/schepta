/**
 * Vuetify FormSectionTitle Component
 */

import { defineComponent, h } from 'vue';

export const FormSectionTitle = defineComponent({
  name: 'VuetifyFormSectionTitle',
  props: {
    title: String,
  },
  setup(props) {
    return () => {
      return h(
        'h3',
        {
          style: {
            fontSize: '1.25rem',
            fontWeight: '500',
            marginBottom: '16px',
            color: '#1976d2',
          },
        },
        props.title
      );
    };
  },
});
