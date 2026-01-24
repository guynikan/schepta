import React from "react";
import { Heading } from "@chakra-ui/react";

export const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
    return (
      <Heading size="md" mb={4} {...props}>
        {content || children}
      </Heading>
    );
  };