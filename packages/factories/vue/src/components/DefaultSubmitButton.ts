/**
 * Default Submit Button Component for Vue
 *
 * Built-in submit button for forms. Uses type="submit" to trigger form submission.
 */

import { defineComponent, h, mergeProps, type PropType, type Component } from 'vue';
import { sanitizeDOMProps } from '@schepta/core';

/**
 * Props for SubmitButton component.
 * Use this type when creating a custom SubmitButton.
 */
export interface SubmitButtonProps {
  /** Submit handler - triggers form submission (when used standalone) */
  onSubmit?: () => void;
}

/**
 * Component type for custom SubmitButton.
 */
export type SubmitButtonComponentType = Component<SubmitButtonProps>;

/**
 * Default submit button component for Vue
 * Uses type="submit" to trigger parent form's submit handler
 */
export const DefaultSubmitButton = defineComponent({
  name: 'DefaultSubmitButton',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () =>
      h('div', mergeProps({ style: { marginTop: '24px', textAlign: 'right' } }, sanitizeDOMProps(attrs, 'div')), [
        h('button', {
          type: 'submit',
          'data-test-id': 'submit-button',
          style: {
            padding: '12px 24px',
            backgroundColor: 'var(--schepta-brand)',
            color: 'var(--schepta-brand-text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
          },
        }, 'Submit'),
      ]);
  },
});
