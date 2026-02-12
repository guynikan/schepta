import React, { useMemo } from "react";
import {
  ChakraProvider,
  extendTheme,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import type { StorageManager } from "@chakra-ui/react";
import { Form } from "../components/Form";
import { FormSchema } from "@schepta/core";
import simpleFormSchema from "../../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../../instances/form/complex-form.json";
import { getToken } from "../../../../utils/getToken";

interface ChakraFormPageProps {
  isDark?: boolean;
}

export function ChakraFormPage({ isDark = false }: ChakraFormPageProps) {
  const simpleSchema = simpleFormSchema as FormSchema;
  const complexSchema = complexFormSchema as FormSchema;

  const theme = useMemo(
    () => {
      const bg = getToken("--schepta-bg", "#ffffff");
      const bgSoft = getToken("--schepta-bg-soft", "#f6f6f7");
      const text1 = getToken("--schepta-text-1", "#333333");
      const text2 = getToken("--schepta-text-2", "#666666");
      const border = getToken("--schepta-border", "#cccccc");

      return extendTheme({
        config: {
          initialColorMode: isDark ? "dark" : "light",
          useSystemColorMode: false,
        },
        semanticTokens: {
          colors: {
            "chakra-body-bg": { _light: bg, _dark: bg },
            "chakra-body-text": { _light: text1, _dark: text1 },
            "chakra-border-color": { _light: border, _dark: border },
            "chakra-subtle-bg": { _light: bgSoft, _dark: bgSoft },
            "chakra-subtle-text": { _light: text2, _dark: text2 },
          },
        },
      });
    },
    [isDark]
  );

  return (
    <ChakraProvider theme={theme}>
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
