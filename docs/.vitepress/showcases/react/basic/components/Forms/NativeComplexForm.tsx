import React, { useState, useMemo } from "react";
import { FormFactory, useScheptaFormAdapter } from "@schepta/factory-react";
import { FormSchema, generateValidationSchema, createComponentSpec } from "@schepta/core";

interface FormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
}

/**
 * Custom component for Social Name input with toggle behavior
 * - When openSocialName is false: shows a button to add
 * - When openSocialName is true: shows the input and a button to remove
 */
interface SocialNameInputProps {
  name: string;
  schema: any;
  externalContext: {
    openSocialName: boolean;
    setOpenSocialName: (value: boolean) => void;
  };
}

const SocialNameInput = ({ name, schema, externalContext }: SocialNameInputProps) => {
  const { openSocialName, setOpenSocialName } = externalContext;
  const label = schema['x-component-props']?.label || 'Social Name';
  const placeholder = schema['x-component-props']?.placeholder || '';
  
  // Get form adapter to register the field
  const adapter = useScheptaFormAdapter();
  const register = adapter?.register;

  return (
    <div style={{ marginBottom: '16px', gridColumn: '1 / -1' }}>
      <button
        type="button"
        data-test-id="social-name-toggle"
        onClick={() => setOpenSocialName(!openSocialName)}
        style={{
          background: 'none',
          border: 'none',
          color: '#2563eb',
          cursor: 'pointer',
          padding: 0,
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {openSocialName ? `- Remove ${label}` : `+ Add ${label}`}
      </button>
      
      {openSocialName && (
        <div style={{ marginTop: '8px', width: '49%' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            {label}
          </label>
          <input
            type="text"
            data-test-id="social-name-input"
            placeholder={placeholder}
            {...(register ? register(name) : { name })}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export const NativeComplexForm = ({ schema }: FormProps) => {
  const [submittedValues, setSubmittedValues] = useState<Record<
    string,
    any
  > | null>(null);
  const [openSocialName, setOpenSocialName] = useState(false);

  const initialValues = useMemo(() => {
    const { initialValues: schemaInitialValues } =
      generateValidationSchema(schema);
    return {
      ...schemaInitialValues,
      ...{
        userInfo: {
          enrollment: "8743",
        },
      },
    };
  }, [schema]);

  // Register custom components for x-custom fields
  const customComponents = useMemo(() => ({
    socialName: createComponentSpec({
      id: 'socialName', // Same as the key name in the schema
      type: 'field',
      component: () => SocialNameInput,
    }),
  }), []);

  const handleSubmit = (values: Record<string, any>) => {
    console.log("Form submitted:", values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div
        style={{
          marginBottom: "24px",
          padding: "20px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
          What you can see in this form:
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8" }}>
          <li style={{ marginBottom: "8px" }}>
            <strong>Custom Components (x-custom):</strong> Social Name field with toggle behavior
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Template Expressions:</strong> Conditional visibility (spouseName appears when maritalStatus is 'married')
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Disabled Fields:</strong> Enrollment field is disabled
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Required Fields:</strong> Email, Phone, First Name, Last Name, Accept Terms
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Grid Layout:</strong> 2-column grid with full-width fields (socialName, spouseName)
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Input Types:</strong> Text, Phone, Select, Date, Textarea, Checkbox
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Sections:</strong> Organized with section containers and titles
            <ul style={{ marginTop: "4px", marginBottom: "4px" }}>
              <li>
                <strong>User Information</strong> contains two subsections:
                <ul style={{ marginTop: "4px" }}>
                  <li><strong>basicInfo:</strong> enrollment, firstName, lastName, socialName, userType, birthDate, maritalStatus, spouseName</li>
                  <li><strong>additionalInfo:</strong> bio, acceptTerms</li>
                </ul>
              </li>
            </ul>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Field Ordering:</strong> Custom order via x-ui.order
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Initial Values:</strong> Pre-filled enrollment value
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>External Context:</strong> State management for custom components
          </li>
        </ul>
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "24px",
          borderRadius: "8px",
        }}
      >
        <FormFactory
          schema={schema}
          initialValues={initialValues}
          customComponents={customComponents}
          externalContext={{
            openSocialName,
            setOpenSocialName,
          }}
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
          <h3 style={{ marginTop: 0 }}>Submitted Values:</h3>
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
        </div>
      )}
    </>
  );
};
