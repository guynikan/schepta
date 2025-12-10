import React from 'react';
import { useFormContext } from 'react-hook-form';

// Simple input component
export const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, externalContext, ...rest } = props;
  
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

export const FormField = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const FormSectionContainer = ({ children, ...props }: any) => {
  return <div style={{ marginBottom: '24px' }} {...props}>{children}</div>;
};

export const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
  return <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333' }} {...props}>{content || children}</h2>;
};

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const FormSectionGroup = ({ children, columns, ...props }: any) => {
  const gridColumns = columns || 'repeat(auto-fit, minmax(200px, 1fr))';
  return <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '16px' }} {...props}>{children}</div>;
};

export const SubmitButton = ({ children, 'x-content': content, onSubmit, externalContext, ...props }: any) => {
  const formContext = useFormContext();
  const handleSubmit = formContext?.handleSubmit;
  
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

export const FormContainer = ({ children, onSubmit, externalContext, ...props }: any) => {
  const formContext = useFormContext();
  const handleSubmit = formContext?.handleSubmit;
  
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

