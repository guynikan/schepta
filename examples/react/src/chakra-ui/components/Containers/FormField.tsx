import React from "react";
import { Box } from "@chakra-ui/react";

export const FormField = ({ children, ...props }: any) => {
    return <Box data-test-id="FormField" {...props}>{children}</Box>;
  };