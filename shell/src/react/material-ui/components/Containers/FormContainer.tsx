import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormContainerProps } from "@schepta/factory-react";
import { SubmitButton } from "../SubmitButton";
import { useScheptaFormAdapter } from "@schepta/factory-react";

export const FormContainer: React.FC<FormContainerProps & BoxProps> = ({ 
  children, 
  onSubmit, 
}) => {
  const adapter = useScheptaFormAdapter();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) adapter.handleSubmit(onSubmit)();
  };

  return (
    <Box
      component="form"
      data-test-id="FormContainer"
      onSubmit={handleFormSubmit}
    >
      {children}
      {onSubmit && <SubmitButton onSubmit={onSubmit} />}
    </Box>
  );
};