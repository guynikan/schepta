import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormSectionContainerProps } from "@schepta/factory-react";

export const FormSectionContainer: React.FC<FormSectionContainerProps & BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      sx={{ mb: 3 }}
      {...props}
    >
      {children}
    </Box>
  );
};
