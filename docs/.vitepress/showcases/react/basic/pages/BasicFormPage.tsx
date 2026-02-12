import React, { useMemo, useState } from "react";
import { Tab, Tabs, Paper, ThemeProvider, createTheme } from "@mui/material";
import simpleFormSchema from "../../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../../instances/form/complex-form.json";
import { NativeForm } from "../components/Forms/NativeForm";
import { TabPanel } from "../../material-ui/pages/MaterialFormPage";
import { ModalForm } from "../components/Forms/ModalForm";
import { FormWithRHF } from "../components/Forms/FormWithRHF";
import { FormWithFormik } from "../components/Forms/FormWithFormik";
import { FormSchema } from "@schepta/core";
import { NativeComplexForm } from "../components/Forms/NativeComplexForm";
import { getToken } from "../../../../utils/getToken";

interface BasicFormPageProps {
  isDark?: boolean;
}

export function BasicFormPage({ isDark = false }: BasicFormPageProps) {
  const [tabValue, setTabValue] = useState(0);
  const simpleSchema = simpleFormSchema as FormSchema;
  const complexSchema = complexFormSchema as FormSchema;


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        background: {
          default: getToken("--schepta-bg", "#ffffff"),
          paper: getToken("--schepta-bg", "#ffffff"),
        },
        text: {
          primary: getToken("--schepta-text-1", "#333333"),
          secondary: getToken("--schepta-text-2", "#666666"),
        },
        divider: getToken("--schepta-border", "#cccccc"),
      },
    });
  }, [isDark]);

  return (
    <ThemeProvider theme={muiTheme}>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--schepta-border)', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="basic tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab data-test-id="simple-form-tab" label="Simple Form" />
          <Tab data-test-id="complex-form-tab" label="Complex Form" />
          <Tab data-test-id="modal-form-tab" label="Modal Form" />
          <Tab data-test-id="rhf-form-tab" label="with React Hook Form" />
          <Tab data-test-id="formik-form-tab" label="with Formik" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <NativeForm schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <NativeComplexForm schema={complexSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ModalForm schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <FormWithRHF schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <FormWithFormik schema={simpleSchema} />
        </TabPanel>
      </Paper>
    </ThemeProvider>
  );
}
