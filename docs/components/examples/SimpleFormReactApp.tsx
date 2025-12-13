import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec } from '@schepta/core';
import simpleFormSchema from '../../../instances/form/simple-form.json';

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
  const { label, name, value, onChange, options = [], placeholder = 'Select...', ...rest } = props;
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
    </div>
  );
});

const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, checked, onChange, ...rest } = props;
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          ref={ref}
          type="checkbox"
          id={name}
          name={name}
          data-test-id={name}
          checked={checked || false}
          onChange={(e) => onChange?.(e.target.checked)}
          {...rest}
        />
        {label && <span>{label}</span>}
      </label>
    </div>
  );
});

const SubmitButton = ({ children, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = props.externalContext?.onSubmit;
  
  return (
    <button
      type="submit"
      onClick={onSubmit ? handleSubmit(onSubmit) : undefined}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500'
      }}
      {...props}
    >
      {children || 'Submit'}
    </button>
  );
};

const FormContainer = ({ children, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
  return (
    <form 
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      style={{ maxWidth: '600px', margin: '0 auto' }}
      {...props}
    >
      {children}
    </form>
  );
};

const FormSection = ({ children, ...props }: any) => {
  return (
    <div style={{ marginBottom: '24px' }} {...props}>
      {children}
    </div>
  );
};

const FormSectionGroup = ({ children, columns = '1fr 1fr', ...props }: any) => {
  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: columns, 
        gap: '16px' 
      }} 
      {...props}
    >
      {children}
    </div>
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
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'button',
    factory: (props, runtime) => SubmitButton,
  }),
  'form-section': createComponentSpec({
    id: 'form-section',
    type: 'container',
    factory: (props, runtime) => FormSection,
  }),
  'form-section-group': createComponentSpec({
    id: 'form-section-group',
    type: 'container',
    factory: (props, runtime) => FormSectionGroup,
  }),
};

export default function SimpleFormReactApp() {
  const methods = useForm();
  
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    alert('Form submitted! Check console for values.');
  };

  return (
    <FormProvider {...methods}>
      <FormFactory
        schema={simpleFormSchema as any}
        components={components}
        onSubmit={handleSubmit}
        debug={false}
      />
    </FormProvider>
  );
}

