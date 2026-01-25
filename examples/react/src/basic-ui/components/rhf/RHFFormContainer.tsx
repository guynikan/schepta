/**
 * RHF Form Container
 * 
 * Custom FormContainer that uses react-hook-form for state management.
 * This demonstrates how to integrate RHF with Schepta forms.
 */

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { FormContainerProps } from '@schepta/factory-react';

/**
 * RHF-based FormContainer component.
 * Creates its own useForm context and wraps children with FormProvider.
 * 
 * This component:
 * - Creates a RHF form context with useForm()
 * - Wraps children with FormProvider for nested components to access
 * - Handles form submission with RHF's handleSubmit
 * 
 * @example
 * ```tsx
 * import { createComponentSpec } from '@schepta/core';
 * 
 * const components = {
 *   FormContainer: createComponentSpec({
 *     id: 'FormContainer',
 *     type: 'FormContainer',
 *     factory: () => RHFFormContainer,
 *   }),
 * };
 * ```
 */
export const RHFFormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
}) => {
  const methods = useForm();

  const handleFormSubmit = methods.handleSubmit((values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  });

  return (
    <FormProvider {...methods}>
      <form data-test-id="FormContainer" onSubmit={handleFormSubmit}>
        {children}
        {onSubmit && (
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
            >
              Submit (RHF)
            </button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};
