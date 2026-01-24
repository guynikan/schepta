import { MenuItem } from "@mui/material";
import React from "react";
import { TextField } from "@mui/material";

export const InputSelect = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, options = [], placeholder = 'Select...', ...rest } = props;
    return (
      <TextField
        select
        fullWidth
        inputRef={ref}
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
  });