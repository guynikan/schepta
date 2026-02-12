import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormSectionGroupContainerProps } from "@schepta/factory-react";

export const FormSectionGroupContainer: React.FC<
  FormSectionGroupContainerProps & BoxProps
> = ({
  children,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  return (
    <Box
      {...xComponentProps}
      {...props}
    >
      {children}
    </Box>
  );
};
