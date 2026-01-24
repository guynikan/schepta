import React from "react";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";

export const InputSelect = React.forwardRef<HTMLSelectElement, any>((props, ref) => {
    const { label, name, value, onChange, options = [], placeholder = 'Select...', ...rest } = props;
    return (
      <FormControl>
        {label && <FormLabel>{label}</FormLabel>}
        <Select
          ref={ref}
          name={name}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          data-test-id={name}
          placeholder={placeholder}
          {...rest}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  });