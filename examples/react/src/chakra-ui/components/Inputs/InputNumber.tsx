import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export const InputNumber = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, placeholder, min, max, step, ...rest } = props;
    return (
      <FormControl>
        {label && <FormLabel>{label}</FormLabel>}
        <Input
          ref={ref}
          type="number"
          name={name}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
          min={min}
          max={max}
          step={step}
          data-test-id={name}
          {...rest}
        />
      </FormControl>
    );
  });