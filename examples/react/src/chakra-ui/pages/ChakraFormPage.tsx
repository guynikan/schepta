import React, { useState } from 'react';
import {
  Box,
  Heading,
} from '@chakra-ui/react';

import { FormFactory } from '@schepta/factory-react';
import { FormSchema } from '@schepta/core';
import simpleFormSchema from "../../../../../instances/form/simple-form.json";

export function ChakraFormPage() {
  const schema = simpleFormSchema as FormSchema;
    const [submittedValues, setSubmittedValues] = useState<any>(null);
  
    const handleSubmit = (values: any) => {
      console.log('Form submitted:', values);
      setSubmittedValues(values);
    };
  
    return (
      <>
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          {/* <FormFactory
            schema={schema}
            components={components}
            onSubmit={handleSubmit}
            debug={true}
          /> */}
        </Box>
  
        {submittedValues && (
          <Box
            mt={6}
            p={4}
            bg="gray.50"
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading size="md" mb={3}>
              Valores Submetidos:
            </Heading>
            <Box
              p={3}
              bg="white"
              borderRadius="md"
              overflow="auto"
              fontSize="13px"
              borderWidth="1px"
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(submittedValues, null, 2)}
              </pre>
            </Box>
            <Box
              mt={3}
              p={3}
              bg="blue.50"
              borderLeftWidth="3px"
              borderLeftColor="blue.500"
              borderRadius="md"
              fontSize="13px"
              color="blue.700"
            >
              💡 Os valores também estão disponíveis no console do navegador (F12)
            </Box>
          </Box>
        )}
      </>
    );
  }