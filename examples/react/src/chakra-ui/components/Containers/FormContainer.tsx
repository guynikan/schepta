import React from "react";
import { Box } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

export const FormContainer = ({ children, onSubmit: onSubmitProp, externalContext, ...props }: any) => {
    const { handleSubmit } = useFormContext();
    // FormFactory/orchestrator passes onSubmit in props; fallback to externalContext for schema-driven usage
    const onSubmit = onSubmitProp ?? externalContext?.onSubmit;
    
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