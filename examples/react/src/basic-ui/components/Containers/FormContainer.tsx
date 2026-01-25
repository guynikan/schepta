import React from 'react';
import { useFormContext } from 'react-hook-form';

export const FormContainer = ({ children, onSubmit, externalContext, ...props }: any) => {
    const formContext = useFormContext();
    const handleSubmit = formContext?.handleSubmit;
    
    return (
      <form 
        onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
        data-test-id="FormContainer"
        {...props}
      >
        {children}
      </form>
    );
  };