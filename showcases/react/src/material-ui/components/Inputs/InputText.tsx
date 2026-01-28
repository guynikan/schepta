import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import type { InputTextProps } from "@schepta/factory-react";

export const InputText: React.FC<InputTextProps & TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  ...rest
}) => {
  return (
    <TextField
        fullWidth
        label={label}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        margin="normal"
        {...rest}
      />
    );
};