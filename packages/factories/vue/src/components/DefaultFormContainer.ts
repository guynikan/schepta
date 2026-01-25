/**
 * Default Form Container Component for Vue
 * 
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import { defineComponent, h, type PropType } from 'vue';
import { DefaultSubmitButton, type SubmitButtonComponentType } from './DefaultSubmitButton';

/**
 * Props for FormContainer component.
 * Use this type when creating a custom FormContainer.
 */
export interface FormContainerProps {
  /** Submit handler - when provided, renders a submit button */
  onSubmit?: () => void;
  /** External context passed from FormFactory */
  externalContext?: Record<string, any>;
  /** 
   * Custom SubmitButton component - resolved by FormFactory from registry.
   * If not provided, uses DefaultSubmitButton.
   */
  SubmitButtonComponent?: SubmitButtonComponentType;
}

/**
 * Default form container component for Vue.
 * 
 * Renders children inside a <form> tag with an optional submit button.
 * 
 * - When `onSubmit` is provided: renders submit button inside the form
 * - When `onSubmit` is NOT provided: no submit button (for external submit via formRef)
 */
export const DefaultFormContainer = defineComponent({
  name: 'DefaultFormContainer',
  props: {
    onSubmit: {
      type: Function as PropType<() => void>,
      required: false,
    },
  },
  setup(props, { slots }) {
    return () => {
      return h('form', {
        'data-test-id': 'FormContainer',
        onSubmit: (e: Event) => {
          e.preventDefault();
          props.onSubmit?.();
        }
      }, [
        slots.default?.(),
        props.onSubmit && h(DefaultSubmitButton, { onSubmit: props.onSubmit })
      ]);
    };
  }
});
