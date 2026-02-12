import React from "react";
import { FormControl, FormLabel, Input, InputProps } from "@chakra-ui/react";
import type { InputTextProps } from "@schepta/factory-react";

export const InputText: React.FC<InputTextProps & InputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...rest
}) => {
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...xComponentProps}
        {...rest}
      />
    </FormControl>
  );
};
