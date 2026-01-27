import React from "react";
import { FormControl, FormLabel, Input, InputProps } from "@chakra-ui/react";
import type { InputDateProps } from "@schepta/factory-react";

export const InputDate: React.FC<InputDateProps & InputProps> = ({
  label,
  name,
  value,
  onChange,
  ...rest
}) => {
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        type="date"
        name={name}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
};
