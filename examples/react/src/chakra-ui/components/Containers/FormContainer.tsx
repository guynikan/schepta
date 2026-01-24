import React from "react";
import { Box } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

export const FormContainer = ({ children, externalContext, ...props }: any) => {
    const { handleSubmit } = useFormContext();
    const onSubmit = externalContext?.onSubmit;
    
    return (
      <Box
        as="form"
        onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
        {...props}
      >
        {children}
      </Box>
    );
  };