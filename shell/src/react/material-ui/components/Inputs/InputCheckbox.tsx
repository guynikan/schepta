import React from "react";
import { FormControlLabel, CheckboxProps } from "@mui/material";
import { Checkbox } from "@mui/material";
import type { InputCheckboxProps } from "@schepta/factory-react";

export const InputCheckbox: React.FC<InputCheckboxProps & CheckboxProps> = ({
  label,
  name,
  value,
  onChange,
  ...rest
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
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
};
