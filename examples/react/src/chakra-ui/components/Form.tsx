import React from "react";
import { Box } from "@chakra-ui/react";
import { FormSchema } from "@schepta/core";
import { FormFactory } from "@schepta/factory-react";
import { components } from "./ComponentRegistry";

export const Form = ({ schema }: { schema: FormSchema }) => {
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
          debug={true}
        />
      </Box>
    </>
  );
};
