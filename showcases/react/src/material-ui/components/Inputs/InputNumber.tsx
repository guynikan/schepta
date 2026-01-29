import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import type { InputNumberProps } from "@schepta/factory-react";

export const InputNumber: React.FC<InputNumberProps & TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  ...rest
}) => {
  return (
      <TextField
        fullWidth
        type="number"
        label={label}
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange?.(e.target.value ? Number(e.target.value) : "")
        }
        inputProps={{ min, max, step }}
        data-test-id={name}
        margin="normal"
        {...rest}
      />
    );
};
