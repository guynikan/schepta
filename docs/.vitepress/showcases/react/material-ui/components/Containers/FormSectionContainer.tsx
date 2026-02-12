import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormSectionContainerProps } from "@schepta/factory-react";

export const FormSectionContainer: React.FC<
  FormSectionContainerProps & BoxProps
> = ({
  children,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  return (
    <Box
      sx={{ mb: 3 }}
      {...xComponentProps}
      {...props}
    >
      {children}
    </Box>
  );
};
