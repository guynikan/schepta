import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import type { InputTextareaProps } from "@schepta/factory-react";

export const InputTextarea: React.FC<InputTextareaProps & TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  ...rest
}) => {
  return (
    <TextField
      fullWidth
      multiline
      rows={rows}
      label={label}
      name={name}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      data-test-id={name}
      margin="normal"
      {...rest}
    />
  );
};
