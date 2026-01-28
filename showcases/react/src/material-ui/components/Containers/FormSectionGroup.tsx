import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormSectionGroupProps } from "@schepta/factory-react";

export const FormSectionGroup: React.FC<FormSectionGroupProps & BoxProps> = ({
  children,
  ...props
}) => {

  return (
    <Box
      data-test-id="FormSectionGroup"
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
      gap={4}
      {...props}
    >
      {children}
    </Box>
  );
};
