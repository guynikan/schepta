import React from 'react';
import { useFormContext } from 'react-hook-form';

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