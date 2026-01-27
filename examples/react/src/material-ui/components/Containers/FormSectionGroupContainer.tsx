import React from "react";
import { Box, BoxProps } from "@mui/material";
import type { FormSectionGroupContainerProps } from "@schepta/factory-react";

export const FormSectionGroupContainer: React.FC<FormSectionGroupContainerProps & BoxProps> = ({ children, ...props }) => {
  return <Box data-test-id="FormSectionGroupContainer" {...props}>{children}</Box>;
};
