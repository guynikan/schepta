import { useState } from "react";
import { FormSchema } from "@schepta/core";
import simpleFormSchema from "../../../../../instances/form/simple-form.json";
import { FormFactory } from "@schepta/factory-react";
import { Paper, Typography, Box } from "@mui/material";
import React from "react";

export function MaterialFormPage() {
    const schema = simpleFormSchema as FormSchema;
    const [submittedValues, setSubmittedValues] = useState<any>(null);
  
    const handleSubmit = (values: any) => {
      console.log('Form submitted:', values);
      setSubmittedValues(values);
    };
  
    return (
      <>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* <FormFactory
            schema={schema}
            components={components}
            onSubmit={handleSubmit}
            debug={true}
          /> */}
        </Paper>
  
        {submittedValues && (
          <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Valores Submetidos:
            </Typography>
            <Box
              sx={{
                background: 'white',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '13px',
                border: '1px solid #e0e0e0'
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(submittedValues, null, 2)}
              </pre>
            </Box>
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                background: '#eff6ff',
                borderLeft: '3px solid #3b82f6',
                borderRadius: 1,
                fontSize: '13px',
                color: '#1e40af'
              }}
            >
              💡 Os valores também estão disponíveis no console do navegador (F12)
            </Box>
          </Paper>
        )}
      </>
    );
  }