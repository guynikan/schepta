import React from "react";
import { Box } from "@chakra-ui/react";
import type { FormContainerProps } from "@schepta/factory-react";
import { SubmitButton } from "../SubmitButton";

export const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit, 
}) => {

  return (
    <Box
      as="form"
      data-test-id="FormContainer"
    >
      {children}
      {onSubmit && <SubmitButton onSubmit={onSubmit} />}
    </Box>
  );
};