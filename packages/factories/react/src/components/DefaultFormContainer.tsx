/**
 * Default Form Container Component
 * 
 * Built-in form container that wraps children in a <form> tag
 * and renders a submit button. Can be overridden via createComponentSpec.
 */

import React from 'react';
import { useScheptaFormAdapter } from '../context/schepta-form-context';
import { DefaultSubmitButton, SubmitButtonComponentType } from './DefaultSubmitButton';

/**
 * Props for FormContainer component.
 * Use this type when creating a custom FormContainer.
 */
export interface FormContainerProps {
  /** Form field children */
  children?: React.ReactNode;
  /** Submit handler - when provided, renders a submit button */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** External context passed from FormFactory */
  externalContext?: Record<string, any>;
  /** 
   * Custom SubmitButton component - resolved by FormFactory from registry.
   * If not provided, uses DefaultSubmitButton.
   */
  SubmitButtonComponent?: SubmitButtonComponentType;
}

/**
 * Default form container component.
 * 
 * Renders children inside a <form> tag with an optional submit button.
 * 
 * - When `onSubmit` is provided: renders submit button inside the form
 * - When `onSubmit` is NOT provided: no submit button (for external submit via formRef)
 * 
 * @example Using with FormFactory (automatic)
 * ```tsx
 * <FormFactory schema={schema} onSubmit={handleSubmit} />
 * ```
 * 
 * @example External submit (no internal button)
 * ```tsx
 * const formRef = useRef<FormFactoryRef>(null);
 * <FormFactory ref={formRef} schema={schema} />
 * <button onClick={() => formRef.current?.submit(handleSubmit)}>Submit</button>
 * ```
 */
export const DefaultFormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit,
}) => {
  const adapter = useScheptaFormAdapter();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      adapter.handleSubmit(onSubmit)();
    }
  };

  return (
    <form data-test-id="FormContainer" onSubmit={handleFormSubmit}>
      {children}
      {onSubmit && <DefaultSubmitButton />}
    </form>
  );
};
