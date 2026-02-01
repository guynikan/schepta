import React from "react";
import type { InputPhoneProps } from "@schepta/factory-react";
import { TextField, TextFieldProps } from "@mui/material";

export const InputPhone: React.FC<InputPhoneProps & TextFieldProps> = ({
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
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputProps={{ min, max, step }}
      {...rest}
    />
  );
};
