import React, { useState } from "react";
import { Box, Code, Heading } from "@chakra-ui/react";
import { FormSchema } from "@schepta/core";
import { FormFactory } from "@schepta/factory-react";
import { components } from "./ComponentRegistry";

interface FormProps {
  schema: FormSchema;
  onSubmit?: (values: Record<string, any>) => void;
}

export const Form = ({ schema, onSubmit }: FormProps) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
    onSubmit?.(values);
  };

  return (
    <>
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
      >
        <FormFactory
          schema={schema}
          components={components}
          onSubmit={handleSubmit}
          debug={true}
        />
      </Box>
      {submittedValues && (
        <Box
          mt={6}
          p={4}
          bg="chakra-subtle-bg"
          borderWidth="1px"
          borderRadius="lg"
        >
          <Heading size="sm" mb={3}>Submitted Values:</Heading>
          <Code display="block" whiteSpace="pre" p={3} borderRadius="md">
            {JSON.stringify(submittedValues, null, 2)}
          </Code>
        </Box>
      )}
    </>
  );
};
