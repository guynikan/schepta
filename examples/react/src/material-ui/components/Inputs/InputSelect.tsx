import { MenuItem, TextFieldProps } from "@mui/material";
import React from "react";
import { TextField } from "@mui/material";
import type { InputSelectProps } from "@schepta/factory-react";

export const InputSelect: React.FC<InputSelectProps & TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  ...rest
}) => {
  return (
    <TextField
      select
      fullWidth
        label={label}
        name={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        margin="normal"
        {...rest}
      >
        <MenuItem value="">{placeholder}</MenuItem>
        {options.map((opt: any) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
  );
};