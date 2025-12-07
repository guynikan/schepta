import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec } from '@schepta/core';
import simpleFormSchema from '../../../tests/fixtures/simple-form.json';
import complexFormSchema from '../../../tests/fixtures/complex-form.json';

// Simple input components
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
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

const InputSelect = React.forwardRef<HTMLSelectElement, any>((props, ref) => {
  const { label, name, value, onChange, options = [], placeholder = 'Select...', children, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>}
      <select
        ref={ref}
        id={name}
        name={name}
        data-test-id={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {children}
    </div>
  );
});
InputSelect.displayName = 'InputSelect';

const InputTextarea = React.forwardRef<HTMLTextAreaElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, rows = 4, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>}
      <textarea
        ref={ref}
        id={name}
        name={name}
        data-test-id={name}
        value={value || ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }}
        {...rest}
      />
    </div>
  );
});
InputTextarea.displayName = 'InputTextarea';

const InputNumber = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, min, max, step, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>}
      <input
        ref={ref}
        type="number"
        id={name}
        name={name}
        data-test-id={name}
        value={value || ''}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        {...rest}
      />
    </div>
  );
});
InputNumber.displayName = 'InputNumber';

const InputDate = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={name} style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>}
      <input
        ref={ref}
        type="date"
        id={name}
        name={name}
        data-test-id={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        {...rest}
      />
    </div>
  );
});
InputDate.displayName = 'InputDate';

const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, checked, onChange, children, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          ref={ref}
          type="checkbox"
          name={name}
          data-test-id={name}
          checked={checked || false}
          onChange={(e) => onChange?.(e.target.checked)}
          {...rest}
        />
        {label}
      </label>
      {children}
    </div>
  );
});
InputCheckbox.displayName = 'InputCheckbox';

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

const SubmitButton = ({ children, 'x-content': content, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
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

const FormContainer = ({ children, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
  return (
    <form 
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      {...props}
    >
      {children}
    </form>
  );
};

// Create component specs
const components = {
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
  InputSelect: createComponentSpec({
    id: 'InputSelect',
    type: 'field',
    factory: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox',
    type: 'field',
    factory: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone',
    type: 'field',
    factory: (props, runtime) => InputText,
    defaultProps: { type: 'tel' },
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea',
    type: 'field',
    factory: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber',
    type: 'field',
    factory: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate',
    type: 'field',
    factory: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: (props, runtime) => SubmitButton,
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
};

function FormPage({ schema }: { schema: any }) {
  const [submittedValues, setSubmittedValues] = useState<any>(null);

  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
        <FormFactory
          schema={schema}
          components={components}
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
          <p style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#eff6ff',
            borderLeft: '3px solid #3b82f6',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#1e40af'
          }}>
            💡 Os valores também estão disponíveis no console do navegador (F12)
          </p>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>schepta React Example</h1>
        
        <div style={{ marginBottom: '24px' }}>
          <Link 
            to="/"
            style={{ marginRight: '8px', padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Simple Form
          </Link>
          <Link 
            to="/complex"
            style={{ padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Complex Form
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<FormPage schema={simpleFormSchema} />} />
          <Route path="/complex" element={<FormPage schema={complexFormSchema} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

