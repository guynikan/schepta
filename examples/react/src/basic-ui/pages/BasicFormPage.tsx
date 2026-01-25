import React, { useState } from "react";
import { Tab, Tabs, Box, Paper } from "@mui/material";
import simpleFormSchema from "../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../instances/form/complex-form.json";
import { FormSchema } from "@schepta/core";
import { Form } from "../components/Form";
import { TabPanel } from "../../material-ui/pages/MaterialFormPage";
import { FormModal } from "../components/FormModal";

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
          <Tab label="Simple Form" />
          <Tab label="Complex Form" />
          <Tab label="Form Modal" />
          <Tab label="Expressions Example" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Form schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Form schema={complexSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <FormModal schema={simpleSchema} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <p>Expressions Example</p>
        </TabPanel>
      </Paper>
    </>
  );
}
