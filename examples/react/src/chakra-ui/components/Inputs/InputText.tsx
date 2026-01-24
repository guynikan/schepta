import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, placeholder, ...rest } = props;
    return (
      <FormControl>
        {label && <FormLabel>{label}</FormLabel>}
        <Input
          ref={ref}
          name={name}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          data-test-id={name}
          {...rest}
        />
      </FormControl>
    );
  });