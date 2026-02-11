/**
 * Vuetify FormContainer Component
 */

import { defineComponent, h } from 'vue';
import { VForm } from 'vuetify/components';
import { useScheptaFormAdapter } from '@schepta/factory-vue';
import { SubmitButton } from '../SubmitButton';

export const FormContainer = defineComponent({
  name: 'VuetifyFormContainer',
  props: {
    onSubmit: Function,
  },
  setup(props, { slots }) {
    const adapter = useScheptaFormAdapter();

    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      if (props.onSubmit) {
        adapter.handleSubmit(props.onSubmit)();
      }
    };

    return () => {
      return h(
        VForm,
        {
          'data-test-id': 'FormContainer',
          onSubmit: handleFormSubmit,
        },
        () => [
          slots.default?.(),
          props.onSubmit && h(SubmitButton, { onSubmit: props.onSubmit }),
        ]
      );
    };
  },
});
