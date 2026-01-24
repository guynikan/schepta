import { FormFactory } from "@schepta/factory-react";
import { components } from "./ComponentRegistry";
import { useState } from "react";
import React from "react";
import { FormSchema } from "@schepta/core";

export const Form = ({ schema }: { schema: FormSchema }) => {
  const [submittedValues, setSubmittedValues] = useState<any>(null);

  const handleSubmit = (values: any) => {
    console.log("Form submitted:", values);
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
          components={components}
          onSubmit={handleSubmit}
          debug={true}
        />
      </div>

      {submittedValues && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Valores Submetidos:</h3>
          <pre
            style={{
              background: "white",
              padding: "12px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "13px",
            }}
          >
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
          <p
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: "#eff6ff",
              borderLeft: "3px solid #3b82f6",
              borderRadius: "4px",
              fontSize: "13px",
              color: "#1e40af",
            }}
          >
            💡 Os valores também estão disponíveis no console do navegador (F12)
          </p>
        </div>
      )}
    </>
  );
};
