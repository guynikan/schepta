import React from "react";
import { useFormContext } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";
import type { SubmitButtonProps } from "@schepta/factory-react";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  "x-content": content,
  onSubmit: onSubmitProp,
  externalContext,
  ...props
}) => {
  const { handleSubmit } = useFormContext();
  // FormFactory passes onSubmit directly; fallback to externalContext for schema-driven usage
  const onSubmit = onSubmitProp ?? externalContext?.onSubmit;
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onSubmit) {
        handleSubmit(onSubmit)();
      }
    };
  
    return (
      <Box mt={6} display="flex" justifyContent="flex-end">
        <Button
          type="button"
          colorScheme="blue"
          size="lg"
          onClick={handleClick}
          {...props}
        >
          {content || children || 'Submit'}
        </Button>
      </Box>
    );
  };