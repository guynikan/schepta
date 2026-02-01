import React from "react";
import { FormControl, FormLabel, Select, SelectProps } from "@chakra-ui/react";
import type { InputSelectProps } from "@schepta/factory-react";

export const InputSelect: React.FC<InputSelectProps & SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  ...rest
}) => {
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        name={name}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        placeholder={placeholder}
        {...rest}
      >
        {options.map((opt: any) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
