/**
 * Default Submit Button Component for Vue
 * 
 * Built-in submit button for forms. Can be overridden via createComponentSpec.
 */

import { defineComponent, h, type PropType, type Component } from 'vue';

/**
 * Props for SubmitButton component.
 * Use this type when creating a custom SubmitButton.
 */
export interface SubmitButtonProps {
  /** Submit handler - triggers form submission */
  onSubmit?: () => void;
}

/**
 * Component type for custom SubmitButton.
 */
export type SubmitButtonComponentType = Component<SubmitButtonProps>;

/**
 * Default submit button component for Vue
 * Can be overridden via components prop or ScheptaProvider
 */
export const DefaultSubmitButton = defineComponent({
  name: 'DefaultSubmitButton',
  props: {
    onSubmit: {
      type: Function as PropType<() => void>,
      required: false,
    },
  },
  setup(props) {
    const handleClick = () => {
      if (props.onSubmit) {
        props.onSubmit();
      }
    };

    return () => h('div', { 
      style: { marginTop: '24px', textAlign: 'right' }
    }, [
      h('button', {
        type: 'button',
        onClick: handleClick,
        'data-test-id': 'submit-button',
        style: {
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }
      }, 'Submit')
    ]);
  }
});
