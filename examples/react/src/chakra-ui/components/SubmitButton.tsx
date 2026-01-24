import React from "react";
import { useFormContext } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";

export const SubmitButton = ({ children, 'x-content': content, externalContext, ...props }: any) => {
    const { handleSubmit } = useFormContext();
    const onSubmit = externalContext?.onSubmit;
    
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