import React from "react";
import { TextField } from "@mui/material";

export const InputNumber = React.forwardRef<HTMLInputElement, any>(
  (props, ref) => {
    const {
      label,
      name,
      value,
      onChange,
      placeholder,
      min,
      max,
      step,
      ...rest
    } = props;
    return (
      <TextField
        ref={ref}
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
  },
);
