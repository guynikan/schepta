/**
 * Form with React Hook Form
 * 
 * Example component demonstrating how to use Schepta with react-hook-form.
 * This shows how to inject custom RHF components via the component registry
 * with AJV validation using @hookform/resolvers/ajv.
 */

import React, { useState, useMemo } from 'react';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec, FormSchema } from '@schepta/core';
import { RHFFormContainer } from '../rhf/RHFFormContainer';
import { RHFFieldWrapper } from '../rhf/RHFFieldWrapper';

interface FormWithRHFProps {
  schema: FormSchema;
}

/**
 * FormWithRHF Component
 * 
 * Renders a form using react-hook-form for state management with AJV validation.
 * Demonstrates how to integrate external form libraries with Schepta.
 */
export const FormWithRHF: React.FC<FormWithRHFProps> = ({ schema }) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  // Create RHF components with validation config
  const rhfComponents = useMemo(() => ({
    // Register RHF FieldWrapper - this makes all fields use RHF's Controller
    FieldWrapper: createComponentSpec({
      id: 'FieldWrapper',
      type: 'field-wrapper',
      factory: () => RHFFieldWrapper,
    }),
    // Register RHF FormContainer with validation - this provides the FormProvider context
    FormContainer: createComponentSpec({
      id: 'FormContainer',
      type: 'container',
      factory: () => RHFFormContainer,
    }),
  }), []);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted (RHF):', values);
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
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          This form uses <strong>react-hook-form</strong> with <strong>AJV validation</strong>.
          The FieldWrapper and FormContainer are custom RHF implementations.
        </div>
        <FormFactory
          schema={schema}
          components={rhfComponents}
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
          <h3 style={{ marginTop: 0 }}>Submitted Values (RHF):</h3>
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
