import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import type { InputDateProps } from "@schepta/factory-react";

export const InputDate: React.FC<InputDateProps & TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...rest
}) => {
  return (
    <TextField
      fullWidth
      type="date"
      label={label}
      name={name}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      InputLabelProps={{ shrink: true }}
      data-test-id={name}
      margin="normal"
      {...xComponentProps}
      {...rest}
    />
  );
};
