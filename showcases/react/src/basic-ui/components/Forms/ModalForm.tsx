import { FormFactory } from "@schepta/factory-react";
import type { FormFactoryRef } from "@schepta/factory-react";
import React, { useState, useRef } from "react";
import { FormSchema } from "@schepta/core";

interface FormModalProps {
  schema: FormSchema;
  onSubmit?: (values: Record<string, any>) => void;
}

/**
 * Example component demonstrating external submit button usage.
 * The form is rendered in a modal-like structure where the submit button
 * is outside the FormFactory component (in the footer).
 */
export const ModalForm = ({ schema, onSubmit }: FormModalProps) => {
  const formRef = useRef<FormFactoryRef>(null);
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
    setIsOpen(false);
    onSubmit?.(values);
  };

  const handleExternalSubmit = () => {
    // Call submit on the form ref, passing the submit handler
    formRef.current?.submit(handleSubmit);
  };

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        Open Modal Form
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Modal container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                External Submit Example
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal body - Form WITHOUT onSubmit (no internal button) */}
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <FormFactory
                ref={formRef}
                schema={schema}
                debug={true}
                // Note: No onSubmit prop = no internal submit button
              />
            </div>

            {/* Modal footer - External submit button */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExternalSubmit}
                data-test-id="external-submit-button"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Submit Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display submitted values */}
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
