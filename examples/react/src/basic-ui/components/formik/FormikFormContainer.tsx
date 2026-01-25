/**
 * Formik Form Container
 * 
 * Custom FormContainer that uses Formik for state management.
 * This demonstrates how to integrate Formik with Schepta forms.
 */

import React from 'react';
import { Formik, Form } from 'formik';
import type { FormContainerProps } from '@schepta/factory-react';

/**
 * Formik-based FormContainer component.
 * Wraps children with Formik context for form state management.
 * 
 * This component:
 * - Creates a Formik form context
 * - Wraps children with Formik's Form component
 * - Handles form submission with Formik's onSubmit
 * 
 * @example
 * ```tsx
 * import { createComponentSpec } from '@schepta/core';
 * 
 * const components = {
 *   FormContainer: createComponentSpec({
 *     id: 'FormContainer',
 *     type: 'FormContainer',
 *     factory: () => FormikFormContainer,
 *   }),
 * };
 * ```
 */
export const FormikFormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
}) => {
  const handleSubmit = (values: Record<string, any>) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Formik
      initialValues={{}}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form data-test-id="FormContainer">
          {children}
          {onSubmit && (
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                data-test-id="submit-button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit (Formik)'}
              </button>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};
