import React from "react";
import { FormControl, FormLabel, Input, InputProps } from "@chakra-ui/react";
import type { InputNumberProps } from "@schepta/factory-react";

export const InputNumber: React.FC<InputNumberProps & InputProps> = ({
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
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        type="number"
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange?.(e.target.value ? Number(e.target.value) : "")
        }
        min={min}
        max={max}
        step={step}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
};
