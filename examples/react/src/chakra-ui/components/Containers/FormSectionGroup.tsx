import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";

export const FormSectionGroup = ({ children, 'x-component-props': xComponentProps, ...props }: any) => {
    const columns = xComponentProps?.columns || '1fr 1fr';
    const gridColumns = columns === '1fr' ? 1 : 2;
    
    return (
      <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4} {...props}>
        {React.Children.map(children, (child, index) => (
          <GridItem key={index}>{child}</GridItem>
        ))}
      </Grid>
    );
  };