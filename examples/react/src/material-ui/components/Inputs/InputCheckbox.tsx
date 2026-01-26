import React from "react";
import { FormControlLabel } from "@mui/material";
import { Checkbox } from "@mui/material";

export const InputCheckbox = React.forwardRef<HTMLInputElement, any>(
  (props, ref) => {
    const { label, name, value, onChange, ...rest } = props;
    return (
      <FormControlLabel
        control={
          <Checkbox
            inputRef={ref}
            name={name}
            checked={value || false}
            onChange={(e) => onChange?.(e.target.checked)}
            data-test-id={name}
            {...rest}
          />
        }
        label={label}
      />
    );
  },
);
