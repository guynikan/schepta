/**
 * Vuetify SubmitButton Component
 */

import { defineComponent, h } from 'vue';
import { VBtn } from 'vuetify/components';

export const SubmitButton = defineComponent({
  name: 'VuetifySubmitButton',
  props: {
    onSubmit: Function,
    label: { type: String, default: 'Submit' },
  },
  setup(props) {
    return () => {
      return h(
        VBtn,
        {
          type: 'submit',
          color: 'primary',
          'data-test-id': 'submit-button',
          style: { marginTop: '16px' },
        },
        () => props.label
      );
    };
  },
});
