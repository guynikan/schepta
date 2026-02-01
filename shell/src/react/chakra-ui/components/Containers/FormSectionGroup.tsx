import React from "react";
import { Grid, GridProps } from "@chakra-ui/react";
import type { FormSectionGroupProps } from "@schepta/factory-react";

export const FormSectionGroup: React.FC<FormSectionGroupProps & GridProps> = ({ children, ...props }) => {
    return (
      <Grid data-test-id="FormSectionGroup" templateColumns={`repeat(auto-fit, minmax(200px, 1fr))`} gap={4} {...props}>
        {children}
      </Grid>
    );
  };