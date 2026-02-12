import React, { useState, useMemo } from "react";
import { FormFactory } from '@schepta/factory-react';
import { FormSchema, generateValidationSchema } from "@schepta/core";

interface FormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
}

export const NativeForm = ({ schema, initialValues: externalInitialValues }: FormProps) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  const initialValues = useMemo(() => {
    const { initialValues: schemaInitialValues } = generateValidationSchema(schema);
    return { ...schemaInitialValues, ...externalInitialValues };
  }, [schema, externalInitialValues]);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div
        style={{
          border: "1px solid var(--schepta-border)",
          padding: "24px",
          borderRadius: "8px",
        }}
      >
        <FormFactory
          schema={schema}
          initialValues={initialValues}
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
          <h3 style={{ marginTop: 0 }}>Submitted Values:</h3>
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
