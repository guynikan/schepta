import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormFactory } from '@schepta/factory-react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { createComponentSpec } from '@schepta/core';
import simpleFormSchema from '../../../tests/fixtures/simple-form.json';

// Simple input component with externalContext usage example
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, externalContext, ...rest } = props;
  
  // Example: Use externalContext for custom logic
  // const user = externalContext?.user;
  // const apiUrl = externalContext?.api;
  // if (user?.role === 'admin') { ... }
  
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>}
      <input
        ref={ref}
        id={name}
        name={name}
        data-test-id={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        {...rest}
      />
    </div>
  );
});

const FormField = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

const FormSectionContainer = ({ children, ...props }: any) => {
  return <div style={{ marginBottom: '24px' }} {...props}>{children}</div>;
};

const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
  return <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333' }} {...props}>{content || children}</h2>;
};

const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

const FormSectionGroup = ({ children, columns, ...props }: any) => {
  const gridColumns = columns || 'repeat(auto-fit, minmax(200px, 1fr))';
  return <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '16px' }} {...props}>{children}</div>;
};

const SubmitButton = ({ children, 'x-content': content, onSubmit, externalContext, ...props }: any) => {
  const formContext = useFormContext();
  const handleSubmit = formContext?.handleSubmit;
  
  // externalContext is available for custom logic (e.g., user, api)
  const user = externalContext?.user;
  const apiUrl = externalContext?.api;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmit) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'right' }}>
      <button
        type="button"
        onClick={handleClick}
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
        {...props}
      >
        {content || children || 'Submit'}
      </button>
    </div>
  );
};

const FormContainer = ({ children, onSubmit, externalContext, ...props }: any) => {
  const formContext = useFormContext();
  const handleSubmit = formContext?.handleSubmit;
  
  // externalContext is available for custom logic (e.g., user, api)
  const user = externalContext?.user;
  const apiUrl = externalContext?.api;
  
  return (
    <form 
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      data-test-id="form-container"
      {...props}
    >
      {children}
    </form>
  );
};

// Global components from provider
const globalComponents = {
  'form-container': createComponentSpec({
    id: 'form-container',
    type: 'form-container',
    factory: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    factory: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    factory: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    factory: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer',
    type: 'container',
    factory: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup',
    type: 'container',
    factory: (props, runtime) => FormSectionGroup,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: (props, runtime) => SubmitButton,
  }),
};

export function ProviderExample() {
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');

  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
    setProviderInfo('Form submitted successfully');
  };

  // Middleware that adds a prefix to labels
  const labelMiddleware = (props: any) => {
    if (props.label) {
      return { ...props, label: `[Provider] ${props.label}` };
    }
    return props;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>schepta Provider Example</h1>
      
      <div style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        background: '#e3f2fd', 
        border: '1px solid #90caf9',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>Provider Features:</h3>
        <ul>
          <li>✅ Global components (InputText, FormField, etc.)</li>
          <li>✅ Global middleware (adds "[Provider]" prefix to labels)</li>
          <li>✅ External context (user info, API URLs, etc.)</li>
        </ul>
      </div>

      <ScheptaProvider
        components={globalComponents}
        middlewares={[labelMiddleware]}
        externalContext={{
          user: { id: 1, name: 'Test User' },
          api: 'https://api.example.com',
        }}
        debug={{ enabled: true }}
      >
        <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
          <FormFactory
            schema={simpleFormSchema}
            onSubmit={handleSubmit}
          />
        </div>
      </ScheptaProvider>

      {submittedValues && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Valores Submetidos:</h3>
          <pre style={{
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
          {providerInfo && (
            <p style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: '#eff6ff',
              borderLeft: '3px solid #3b82f6',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#1e40af'
            }}>
              {providerInfo}
            </p>
          )}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            <strong>ExternalContext disponível:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>User: {JSON.stringify({ id: 1, name: 'Test User' })}</li>
              <li>API: https://api.example.com</li>
            </ul>
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#166534' }}>
              💡 Esses valores estão disponíveis em todos os componentes customizados via prop <code>externalContext</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

