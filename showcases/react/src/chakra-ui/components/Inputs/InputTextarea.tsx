import React from "react";
import {
  FormControl,
  FormLabel,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import type { InputTextareaProps } from "@schepta/factory-react";

export const InputTextarea: React.FC<InputTextareaProps & TextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  ...rest
}) => {
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Textarea
        name={name}
        value={value || ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
};
