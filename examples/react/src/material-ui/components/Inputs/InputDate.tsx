import React from "react";
import { TextField } from "@mui/material";

export const InputDate = React.forwardRef<HTMLInputElement, any>(
  (props, ref) => {
    const { label, name, value, onChange, ...rest } = props;
    return (
      <TextField
        ref={ref}
        fullWidth
        type="date"
        label={label}
        name={name}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        data-test-id={name}
        margin="normal"
        {...rest}
      />
    );
  },
);
