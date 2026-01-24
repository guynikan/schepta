import React from "react";
import { Grid } from "@mui/material";

export const FormSectionGroup = ({
  children,
  "x-component-props": xComponentProps,
  ...props
}: any) => {
  const columns = xComponentProps?.columns || "1fr 1fr";
  const gridColumns = columns === "1fr" ? 12 : 6;

  return (
    <Grid
      container
      spacing={2}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <Grid
          item
          xs={12}
          sm={gridColumns}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};
