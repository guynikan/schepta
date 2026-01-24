import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export const InputDate = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, ...rest } = props;
    return (
      <FormControl>
        {label && <FormLabel>{label}</FormLabel>}
        <Input
          ref={ref}
          type="date"
          name={name}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          data-test-id={name}
          {...rest}
        />
      </FormControl>
    );
  });