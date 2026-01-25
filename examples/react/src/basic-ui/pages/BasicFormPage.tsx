import React, { useState } from "react";
import { Tab, Tabs, Paper } from "@mui/material";
import simpleFormSchema from "../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../instances/form/complex-form.json";
import { NativeForm } from "../components/Forms/NativeForm";
import { TabPanel } from "../../material-ui/pages/MaterialFormPage";
import { ModalForm } from "../components/Forms/ModalForm";
import { FormWithRHF } from "../components/Forms/FormWithRHF";
import { FormWithFormik } from "../components/Forms/FormWithFormik";
import { FormSchema } from "@schepta/core";

export function BasicFormPage() {
  const [tabValue, setTabValue] = useState(0);
  const simpleSchema = simpleFormSchema as FormSchema;
  const complexSchema = complexFormSchema as FormSchema;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Simple Form (Native)" />
          <Tab label="Complex Form (Native)" />
          <Tab label="Modal Form" />
          <Tab label="with React Hook Form" />
          <Tab label="with Formik" />
          <Tab label="Expressions Example" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <NativeForm schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <NativeForm schema={complexSchema} />
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
        <TabPanel value={tabValue} index={5}>
          <p>Expressions Example</p>
        </TabPanel>
      </Paper>
    </>
  );
}
