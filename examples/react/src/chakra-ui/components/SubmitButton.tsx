import React from "react";
import { Box, Button } from "@chakra-ui/react";
import type { SubmitButtonProps } from "@schepta/factory-react";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  "x-content": content,
  onSubmit: onSubmitProp,
  externalContext,
  ...props
}) => {

    return (
      <Box mt={6} display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          {...props}
        >
          {content || children || 'Submit'}
        </Button>
      </Box>
    );
  };