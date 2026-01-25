import React, { useState } from "react";
import { FormFactory } from "@schepta/factory-react";
import { FormSchema } from "@schepta/core";

interface FormProps {
  schema: FormSchema;
}

export const Form = ({ schema }: FormProps) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "24px",
          borderRadius: "8px",
        }}
      >
        <FormFactory
          schema={schema}
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
          <h3 style={{ marginTop: 0 }}>Submitted Values:</h3>
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
