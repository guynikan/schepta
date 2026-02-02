/**
 * Form with Formik
 * 
 * Example component demonstrating how to use Schepta with Formik.
 * This shows how to inject custom Formik field renderer via the renderer registry
 * with AJV validation using createFormikValidator.
 */

import React, { useState, useMemo } from 'react';
import { FormFactory } from '@schepta/factory-react';
import { 
  createComponentSpec,
  createRendererSpec,
  FormSchema, 
} from '@schepta/core';
import { FormikFieldRenderer } from '../formik/FormikFieldRenderer';
import { FormikFormContainer } from '../formik/FormikFormContainer';

interface FormWithFormikProps {
  schema: FormSchema;
}

/**
 * FormWithFormik Component
 * 
 * Renders a form using Formik for state management with AJV validation.
 * Demonstrates how to integrate external form libraries with Schepta.
 */
export const FormWithFormik: React.FC<FormWithFormikProps> = ({ schema }) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  // Create Formik renderers - custom field renderer using Formik's context
  const formikRenderers = useMemo(() => ({
    field: createRendererSpec({
      id: 'formik-field-renderer',
      type: 'field',
      component: () => FormikFieldRenderer,
    }),
  }), []);

  // Create Formik components - custom FormContainer with Formik context
  const formikComponents = useMemo(() => ({
    FormContainer: createComponentSpec({
      id: 'FormContainer',
      type: 'container',
      component: () => FormikFormContainer,
    }),
  }), []);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted (Formik):', values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div
        style={{
          border: '1px solid #ddd',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <div style={{ 
          marginBottom: '16px', 
          padding: '8px 12px', 
          backgroundColor: '#d4edda', 
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          This form uses <strong>Formik</strong> with <strong>AJV validation</strong>.
          The field renderer and FormContainer are custom Formik implementations.
        </div>
        <FormFactory
          schema={schema}
          renderers={formikRenderers}
          components={formikComponents}
          onSubmit={handleSubmit}
          debug={true}
        />
      </div>
      {submittedValues && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginTop: 0 }}>Submitted Values (Formik):</h3>
          <pre style={{
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px',
          }}>
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};
