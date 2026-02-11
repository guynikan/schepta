/**
 * RHF Form Container
 * 
 * Custom FormContainer that uses react-hook-form for state management
 * with AJV validation via @hookform/resolvers/ajv.
 */

import React, { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import type { FormContainerProps } from '@schepta/factory-react';
import { FormSchema, generateValidationSchema } from '@schepta/core';
import { useSchepta } from '@schepta/adapter-react';

/**
 * Creates an RHF-based FormContainer component with validation.
 * Uses react-hook-form's useForm with ajvResolver for validation.
 * 
 * @param jsonSchema - JSON Schema for AJV validation
 * @param defaultValues - Default form values
 * @returns A FormContainer component configured with validation
 * 
 * @example
 * ```tsx
 * import { createComponentSpec, generateValidationSchema } from '@schepta/core';
 * import { createRHFFormContainer } from './RHFFormContainer';
 * 
 * const { jsonSchema, initialValues } = generateValidationSchema(formSchema);
 * 
 * const components = {
 *   FormContainer: createComponentSpec({
 *     id: 'FormContainer',
 *     type: 'container',
 *     factory: () => createRHFFormContainer(jsonSchema, initialValues),
 *   }),
 * };
 * ```
 */

export const RHFFormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
  externalContext,
  ...props
}) => {
  const { schema } = useSchepta();
  const { jsonSchema, initialValues } = useMemo(() => 
    generateValidationSchema(schema as FormSchema, {
      messages: {
        en: {
          required: '{{label}} is required',
          minLength: '{{label}} must be at least {{minLength}} characters',
          maxLength: '{{label}} must be at most {{maxLength}} characters',
          pattern: '{{label}} format is invalid',
        }
      },
      locale: 'en'
    }), [schema]);

    const methods = useForm({
      defaultValues: initialValues,
      resolver: jsonSchema ? ajvResolver(jsonSchema as any) : undefined,
    });

    const handleFormSubmit = methods.handleSubmit((values) => {
      if (onSubmit) {
        onSubmit(values);
      }
    });

    return (
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} {...props}>
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
}