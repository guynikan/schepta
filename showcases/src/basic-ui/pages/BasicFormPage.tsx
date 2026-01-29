import React, { useState } from "react";
import { Tab, Tabs, Paper } from "@mui/material";
import simpleFormSchema from "../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../instances/form/complex-form.json";
import { NativeForm } from "../components/Forms/NativeForm";
import { TabPanel } from "../../material-ui/pages/MaterialFormPage";
import { ModalForm } from "../components/Forms/ModalForm";
import { FormWithRHF } from "../components/Forms/FormWithRHF";
import { FormWithFormik } from "../components/Forms/FormWithFormik";
import { FormSchema } from "@schepta/core";
import { NativeComplexForm } from "../components/Forms/NativeComplexForm";

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
    </>
  );
}
