/**
 * Form with React Hook Form
 * 
 * Example component demonstrating how to use Schepta with react-hook-form.
 * This shows how to inject custom RHF components via the component registry.
 */

import React, { useState } from 'react';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec, FormSchema } from '@schepta/core';
import { RHFFieldWrapper } from '../rhf/RHFFieldWrapper';
import { RHFFormContainer } from '../rhf/RHFFormContainer';

// Import the same input components from basic-ui
import { InputText } from '../Inputs/InputText';
import { InputSelect } from '../Inputs/InputSelect';
import { InputCheckbox } from '../Inputs/InputCheckbox';
import { InputTextarea } from '../Inputs/InputTextarea';
import { InputNumber } from '../Inputs/InputNumber';
import { InputDate } from '../Inputs/InputDate';

/**
 * RHF-specific component registry.
 * Registers the RHF FieldWrapper and FormContainer to use
 * react-hook-form for form state management.
 */
const rhfComponents = {
  // Register RHF FieldWrapper - this makes all fields use RHF's Controller
  FieldWrapper: createComponentSpec({
    id: 'FieldWrapper',
    type: 'field-wrapper',
    factory: () => RHFFieldWrapper,
  }),
  // Register RHF FormContainer - this provides the FormProvider context
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'FormContainer',
    factory: () => RHFFormContainer,
  }),
  // Standard input components (same as basic-ui)
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: () => InputText,
  }),
  InputSelect: createComponentSpec({
    id: 'InputSelect',
    type: 'field',
    factory: () => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox',
    type: 'field',
    factory: () => InputCheckbox,
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea',
    type: 'field',
    factory: () => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber',
    type: 'field',
    factory: () => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate',
    type: 'field',
    factory: () => InputDate,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone',
    type: 'field',
    factory: () => InputText,
    defaultProps: { type: 'tel' },
  }),
};

interface FormWithRHFProps {
  schema: FormSchema;
}

/**
 * FormWithRHF Component
 * 
 * Renders a form using react-hook-form for state management.
 * Demonstrates how to integrate external form libraries with Schepta.
 */
export const FormWithRHF: React.FC<FormWithRHFProps> = ({ schema }) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

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
          This form uses <strong>react-hook-form</strong> for state management.
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
