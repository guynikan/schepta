import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import type { FormFieldProps } from "@schepta/factory-react";

export const FormField: React.FC<FormFieldProps & BoxProps> = ({
  children,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  return (
    <Box
      data-test-id="FormField"
      {...xComponentProps}
      {...props}
    >
      {children}
    </Box>
  );
};
