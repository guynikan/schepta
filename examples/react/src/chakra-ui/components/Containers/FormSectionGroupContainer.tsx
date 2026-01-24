import React from "react";
import { Box } from "@chakra-ui/react";

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
    return <Box {...props}>{children}</Box>;
  };