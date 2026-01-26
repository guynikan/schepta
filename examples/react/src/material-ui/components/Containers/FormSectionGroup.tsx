import React from "react";
import { Box, Grid } from "@mui/material";

export const FormSectionGroup = ({
  children,
  "x-component-props": xComponentProps,
  ...props
}: any) => {
  const columns = xComponentProps?.columns || "1fr 1fr";
  const gridColumns = columns === "1fr" ? 1 : 2;

  return (
    <Box
      data-test-id="FormSectionGroup"
      display="grid"
      gridTemplateColumns={`repeat(${gridColumns}, 1fr)`}
      gap={4}
      {...props}
    >
      {children}
    </Box>
  );
};
