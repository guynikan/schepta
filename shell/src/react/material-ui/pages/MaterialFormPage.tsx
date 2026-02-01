import { FormSchema } from "@schepta/core";
import simpleFormSchema from "../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../instances/form/complex-form.json";
import { Paper, Box, Tabs, Tab } from "@mui/material";
import React, { useState } from "react";
import { Form } from "../components/Form";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function MaterialFormPage() {
  const [tabValue, setTabValue] = useState(0);
  const simpleSchema = simpleFormSchema as FormSchema;
  const complexSchema = complexFormSchema as FormSchema;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{ p: 3 }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="basic tabs"
        >
          <Tab label="Simple Form" />
          <Tab label="Complex Form" />
        </Tabs>
        <TabPanel
          value={tabValue}
          index={0}
        >
          <Form schema={simpleSchema} />
        </TabPanel>
        <TabPanel
          value={tabValue}
          index={1}
        >
          <Form schema={complexSchema} />
        </TabPanel>
      </Paper>
    </>
  );
}
