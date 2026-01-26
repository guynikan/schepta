import React from "react";
import { Box } from "@chakra-ui/react";

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
    return <Box data-test-id="FormSectionGroupContainer" {...props}>{children}</Box>;
  };