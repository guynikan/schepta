import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FormContainerProps } from '@schepta/factory-react';
import { SubmitButton } from '../SubmitButton';

export const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit, 
}) => {
  const formContext = useFormContext();
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) formContext.handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleFormSubmit} data-test-id="FormContainer">
      {children}
      {onSubmit && <SubmitButton onSubmit={onSubmit} />}
    </form>
  );
};