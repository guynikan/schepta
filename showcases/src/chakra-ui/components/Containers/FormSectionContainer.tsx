import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import type { FormSectionContainerProps } from "@schepta/factory-react";

export const FormSectionContainer: React.FC<
  FormSectionContainerProps & BoxProps
> = ({
  children,
  externalContext,
  "x-ui": xUi,
  "x-component-props": xComponentProps,
  ...props
}) => {
  return (
    <Box
      mb={6}
      {...props}
    >
      {children}
    </Box>
  );
};
