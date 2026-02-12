/**
 * Form with React Hook Form
 * 
 * Example component demonstrating how to use Schepta with react-hook-form.
 * This shows how to inject custom RHF field renderer via the renderer registry
 * with AJV validation using @hookform/resolvers/ajv.
 */

import React, { useState, useMemo } from 'react';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec, createRendererSpec, FormSchema } from '@schepta/core';
import { RHFFormContainer } from '../rhf/RHFFormContainer';
import { RHFFieldRenderer } from '../rhf/RHFFieldRenderer';

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

  // Create RHF renderers - custom field renderer using RHF's Controller
  const rhfRenderers = useMemo(() => ({
    field: createRendererSpec({
      id: 'rhf-field-renderer',
      type: 'field',
      component: () => RHFFieldRenderer,
    }),
  }), []);

  // Create RHF components - custom FormContainer with RHF FormProvider
  const rhfComponents = useMemo(() => ({
    FormContainer: createComponentSpec({
      id: 'FormContainer',
      type: 'container',
      component: () => RHFFormContainer,
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
          border: '1px solid var(--schepta-border)',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <div style={{ 
          marginBottom: '16px', 
          padding: '8px 12px', 
          backgroundColor: 'var(--schepta-bg-soft)', 
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          This form uses <strong>react-hook-form</strong> with <strong>AJV validation</strong>.
          The field renderer and FormContainer are custom RHF implementations.
        </div>
        <FormFactory
          schema={schema}
          renderers={rhfRenderers}
          components={rhfComponents}
          onSubmit={handleSubmit}
          debug={true}
        />
      </div>
      {submittedValues && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--schepta-bg-soft)',
          border: '1px solid var(--schepta-border)',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginTop: 0 }}>Submitted Values (RHF):</h3>
          <pre style={{
            background: 'var(--schepta-bg)',
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
