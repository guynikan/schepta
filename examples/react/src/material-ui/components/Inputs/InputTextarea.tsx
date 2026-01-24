import React from "react";
import { TextField } from "@mui/material";

export const InputTextarea = React.forwardRef<HTMLTextAreaElement, any>((props, ref) => {
    const { label, name, value, onChange, placeholder, rows = 4, ...rest } = props;
    return (
      <TextField
        inputRef={ref}
        fullWidth
        multiline
        rows={rows}
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