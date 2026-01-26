import React from "react";
import { Grid } from "@chakra-ui/react";

export const FormSectionGroup = ({ children, 'x-component-props': xComponentProps, ...props }: any) => {
    const columns = xComponentProps?.columns || '1fr 1fr';
    const gridColumns = columns === '1fr' ? 1 : 2;
    
    return (
      <Grid data-test-id="FormSectionGroup" templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4} {...props}>
        {children}
      </Grid>
    );
  };