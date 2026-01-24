import React, { useState } from "react";
import { SimpleForm } from "../components/Forms/SimpleForm";
import { Tab, Tabs, Box, Paper } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
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

export function BasicFormPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Simple Form" />
          <Tab label="Complex Form" />
          <Tab label="Provider Example" />
          <Tab label="Expressions Example" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <SimpleForm />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <p>Complex Form</p>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <p>Provider Example</p>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <p>Expressions Example</p>
        </TabPanel>
      </Paper>
    </>
  );

  // const schema = simpleFormSchema as FormSchema;
  // const [submittedValues, setSubmittedValues] = useState<any>(null);

  // const handleSubmit = (values: any) => {
  //   console.log("Form submitted:", values);
  //   setSubmittedValues(values);
  // };

  // return (
  //   <>
  //     <div
  //       style={{
  //         border: "1px solid #ddd",
  //         padding: "24px",
  //         borderRadius: "8px",
  //       }}
  //     >
  //       <FormFactory
  //         schema={schema}
  //         components={components}
  //         onSubmit={handleSubmit}
  //         debug={true}
  //       />
  //     </div>

  //     {submittedValues && (
  //       <div
  //         style={{
  //           marginTop: "24px",
  //           padding: "16px",
  //           background: "#f9fafb",
  //           border: "1px solid #e5e7eb",
  //           borderRadius: "8px",
  //         }}
  //       >
  //         <h3 style={{ marginTop: 0 }}>Valores Submetidos:</h3>
  //         <pre
  //           style={{
  //             background: "white",
  //             padding: "12px",
  //             borderRadius: "4px",
  //             overflow: "auto",
  //             fontSize: "13px",
  //           }}
  //         >
  //           {JSON.stringify(submittedValues, null, 2)}
  //         </pre>
  //         <p
  //           style={{
  //             marginTop: "12px",
  //             padding: "8px 12px",
  //             background: "#eff6ff",
  //             borderLeft: "3px solid #3b82f6",
  //             borderRadius: "4px",
  //             fontSize: "13px",
  //             color: "#1e40af",
  //           }}
  //         >
  //           💡 Os valores também estão disponíveis no console do navegador (F12)
  //         </p>
  //       </div>
  //     )}
  //   </>
  // );
}
