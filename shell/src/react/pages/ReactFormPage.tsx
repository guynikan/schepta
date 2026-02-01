import React, { useState } from "react";
import { Tab, Tabs, Paper } from "@mui/material";
import { FaReact } from "react-icons/fa";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ padding: '1rem 0' }}
    >
      {value === index && children}
    </div>
  );
}

export function ReactFormPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '8px', margin: '1rem 0' }}>
      <div style={{ color: '#61dafb', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaReact size={32} />
        <h2>React Microfrontend - Schepta Forms</h2>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="react forms">
            <Tab label="Simple Form" />
            <Tab label="Complex Form" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <h3>Simple React Form</h3>
            <p>Esta é uma demonstração básica do Schepta no React (monorepo unificado)</p>
            <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '4px', marginTop: '1rem' }}>
              <p><strong>✅ Funcionando!</strong> Este microfrontend React está rodando dentro do shell principal.</p>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <h3>Complex React Form</h3>
            <p>Aqui seria um formulário mais complexo com Schepta</p>
          </TabPanel>
        </Paper>
      </div>
    </div>
  );
}