import React from "react";
import { Box } from "@mui/material";

export const FormSectionContainer = ({ children, ...props }: any) => {
  return (
    <Box
      sx={{ mb: 3 }}
      {...props}
    >
      {children}
    </Box>
  );
};
