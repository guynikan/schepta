/**
 * Default Submit Button Component
 * 
 * Built-in submit button for forms. Can be overridden via createComponentSpec.
 */

import React from 'react';

/**
 * Props passed to the SubmitButton component by FormFactory.
 * Use this type when customizing SubmitButton via components.SubmitButton to ensure
 * correct typing and that onSubmit is always handled.
 *
 * @example
 * ```tsx
 * import { SubmitButtonProps } from '@schepta/factory-react';
 * import { useFormContext } from 'react-hook-form';
 *
 * const MySubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, children }) => {
 *   const { handleSubmit } = useFormContext();
 *   return (
 *     <button type="button" onClick={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
 *       {children ?? 'Submit'}
 *     </button>
 *   );
 * };
 * ```
 */
export interface SubmitButtonProps {
  /**
   * Submit handler - called with form values.
   * FormFactory always passes this when rendering the built-in SubmitButton.
   * When used from schema, it may also be provided via externalContext.onSubmit.
   */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Optional label (e.g. from x-content when used from schema) */
  'x-content'?: string;
  /** Optional external context (when used from schema). May contain onSubmit. */
  externalContext?: Record<string, any>;
  /** Optional children */
  children?: React.ReactNode;
  "x-component-props"?: Record<string, any>;
  "x-ui"?: Record<string, any>;
}

/**
 * Component type for custom SubmitButton. Use with createComponentSpec when
 * registering a custom SubmitButton in components.
 */
export type SubmitButtonComponentType = React.ComponentType<SubmitButtonProps>;

/**
 * Default submit button component
 * Can be overridden via components prop or ScheptaProvider
 */
export const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, "x-component-props": xComponentProps, "x-ui": xUi }) => {
  return (
    <div style={{ marginTop: '24px', textAlign: 'right' }}>
      <button
        type="submit"
        data-test-id="submit-button"
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }}
        {...xComponentProps}
      >
        Submit
      </button>
    </div>
  );
};
