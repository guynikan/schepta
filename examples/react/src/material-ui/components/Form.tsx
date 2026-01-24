import React, { useState } from "react";
import { Paper, Box, Typography } from "@mui/material";
import { FormSchema } from "@schepta/core";
import { FormFactory } from "@schepta/factory-react";
import { components } from "./ComponentRegistry";

interface FormProps {
  schema: FormSchema;
  onSubmit?: (values: Record<string, any>) => void;
}

export const Form = ({ schema, onSubmit }: FormProps) => {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
    onSubmit?.(values);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{ p: 4 }}
      >
        <FormFactory
          schema={schema}
          components={components}
          onSubmit={handleSubmit}
          debug={true}
        />
      </Paper>
      {submittedValues && (
        <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle1" gutterBottom>
            Submitted Values:
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '13px',
            }}
          >
            {JSON.stringify(submittedValues, null, 2)}
          </Box>
        </Paper>
      )}
    </>
  );
};
