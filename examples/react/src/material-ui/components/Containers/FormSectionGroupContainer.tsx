import React from "react";
import { Box } from "@mui/material";

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <Box data-test-id="FormSectionGroupContainer" {...props}>{children}</Box>;
};
