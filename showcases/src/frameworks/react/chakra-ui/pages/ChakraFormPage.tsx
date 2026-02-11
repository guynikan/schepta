import React from "react";
import {
  ChakraProvider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import { Form } from "../components/Form";
import { FormSchema } from "@schepta/core";
import simpleFormSchema from "../../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../../instances/form/complex-form.json";

export function ChakraFormPage() {
  const simpleSchema = simpleFormSchema as FormSchema;
  const complexSchema = complexFormSchema as FormSchema;

  return (
    <ChakraProvider>
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
      >
        <Tabs>
          <TabList>
            <Tab>SIMPLE FORM</Tab>
            <Tab>COMPLEX FORM</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Form schema={simpleSchema} />
            </TabPanel>
            <TabPanel>
              <Form schema={complexSchema} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ChakraProvider>
  );
}
