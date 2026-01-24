import React from "react";
import { TextField } from "@mui/material";

export const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, placeholder, ...rest } = props;
    return (
      <TextField
        ref={ref}
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
  });