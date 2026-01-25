import React from 'react';
import type { SubmitButtonProps } from '@schepta/factory-react';

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  'x-content': content,
  ...props
}) => {


  return (
    <div style={{ marginTop: '24px', textAlign: 'right' }}>
      <button
        type="submit"
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