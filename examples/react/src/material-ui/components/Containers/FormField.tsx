import React from "react";
import { Box } from "@mui/material";

export const FormField = ({ children, ...props }: any) => {
  return <Box data-test-id="FormField" {...props}>{children}</Box>;
};
