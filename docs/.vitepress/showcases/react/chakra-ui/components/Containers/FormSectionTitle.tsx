import React from "react";
import { Heading, HeadingProps } from "@chakra-ui/react";
import type { FormSectionTitleProps } from "@schepta/factory-react";

export const FormSectionTitle: React.FC<
  FormSectionTitleProps & HeadingProps
> = ({
  "x-content": content,
  children,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...props
}) => {
  return (
    <Heading
      size="md"
      mb={4}
      {...xComponentProps}
      {...props}
    >
      {content || children}
    </Heading>
  );
};
