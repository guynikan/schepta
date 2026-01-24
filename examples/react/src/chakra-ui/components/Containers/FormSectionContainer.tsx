import React from "react";
import { Box } from "@chakra-ui/react";

export const FormSectionContainer = ({ children, ...props }: any) => {
    return <Box mb={6} {...props}>{children}</Box>;
  };