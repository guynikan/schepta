/**
 * Default Form Container Component for Vue
 *
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';
import { DefaultSubmitButton } from './DefaultSubmitButton';
import { useScheptaFormAdapter } from '../context/schepta-form-context';

/**
 * Props for FormContainer component.
 * Use this type when creating a custom FormContainer.
 */
export interface FormContainerProps {
  /** Submit handler - when provided, renders a submit button */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** External context passed from FormFactory */
  externalContext?: Record<string, any>;
}

/**
 * Default form container component for Vue.
 *
 * Renders children inside a <form> tag with an optional submit button.
 * Uses ScheptaFormAdapter for form submission.
 */
export const DefaultFormContainer = defineComponent({
  name: 'DefaultFormContainer',
  inheritAttrs: false,
  props: {
    onSubmit: {
      type: Function as PropType<(values: Record<string, any>) => void | Promise<void>>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const adapter = useScheptaFormAdapter();
    return () => {
      const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (props.onSubmit) {
          adapter.handleSubmit(props.onSubmit)();
        }
      };
      return h(
        'form',
        mergeProps(
          { 'data-test-id': 'FormContainer', onSubmit: handleSubmit },
          sanitizeDOMProps(attrs, 'form')
        ),
        [
          slots.default?.(),
          props.onSubmit && h(DefaultSubmitButton),
        ]
      );
    };
  },
});
