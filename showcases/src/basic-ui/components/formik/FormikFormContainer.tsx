/**
 * Formik Form Container
 *
 * Custom FormContainer that uses Formik for state management
 * with AJV validation via createFormikValidator.
 */

import React, { useMemo } from "react";
import { Formik, Form } from "formik";
import type { FormContainerProps } from "@schepta/factory-react";
import {
  createFormikValidator,
  FormSchema,
  generateValidationSchema,
} from "@schepta/core";
import { useSchepta } from "@schepta/adapter-react";

/**
 * Creates a Formik-based FormContainer component with validation.
 * Uses Formik with a custom validate function powered by AJV.
 *
 * @param validate - Validation function from createFormikValidator
 * @param defaultValues - Default form values
 * @returns A FormContainer component configured with validation
 *
 
 */
export const FormikFormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
  ...props
}) => {
  const { schema } = useSchepta();
  const { initialValues, validate } = useMemo(() => {
    const { initialValues } = generateValidationSchema(schema as FormSchema, {
      messages: {
        en: {
          required: '{{label}} is required',
          minLength: '{{label}} must be at least {{minLength}} characters',
          maxLength: '{{label}} must be at most {{maxLength}} characters',
          pattern: '{{label}} format is invalid',
        }
      },
      locale: 'en'
    });
    
    const validate = createFormikValidator(schema as FormSchema, {
      messages: {
        en: {
          required: '{{label}} is required',
          minLength: '{{label}} must be at least {{minLength}} characters',
          maxLength: '{{label}} must be at most {{maxLength}} characters',
          pattern: '{{label}} format is invalid',
        }
      },
      locale: 'en'
    });
    
    return { initialValues, validate };
  }, [schema]);

  const handleSubmit = (values: Record<string, any>) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Formik
      initialValues={initialValues || {}}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form {...props}>
          {children}
          {onSubmit && (
            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                data-test-id="submit-button"
                style={{
                  padding: "12px 24px",
                  backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit (Formik)"}
              </button>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}
