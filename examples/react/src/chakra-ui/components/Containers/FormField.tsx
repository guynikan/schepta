import React from "react";
import { Box } from "@chakra-ui/react";

export const FormField = ({ children, ...props }: any) => {
    return <Box {...props}>{children}</Box>;
  };