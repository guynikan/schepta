import React from "react";
import { Paper } from "@mui/material";
import { FormSchema } from "@schepta/core";
import { FormFactory } from "@schepta/factory-react";
import { components } from "./ComponentRegistry";

export const Form = ({ schema }: { schema: FormSchema }) => {
  return (
    <>
      <Paper
        elevation={2}
        sx={{ p: 4 }}
      >
        <FormFactory
          schema={schema}
          components={components}
          debug={true}
        />
      </Paper>
    </>
  );
};
