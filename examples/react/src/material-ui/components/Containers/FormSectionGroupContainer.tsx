import React from "react";
import { Box } from "@mui/material";

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <Box {...props}>{children}</Box>;
};
