import { FormSchema } from "@schepta/core";
import simpleFormSchema from "../../../../../../instances/form/simple-form.json";
import complexFormSchema from "../../../../../../instances/form/complex-form.json";
import { Paper, Box, Tabs, Tab, ThemeProvider, createTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { Form } from "../components/Form";
import { getToken } from "../../../../utils/getToken";

interface MaterialFormPageProps {
  isDark?: boolean;
}

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

export function MaterialFormPage({ isDark = false }: MaterialFormPageProps) {
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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid var(--schepta-border)",
          borderRadius: 2,
        }}
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
    </ThemeProvider>
  );
}
