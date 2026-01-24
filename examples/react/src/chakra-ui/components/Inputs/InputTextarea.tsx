import React from "react";
import { FormControl, FormLabel, Textarea } from "@chakra-ui/react";

export const InputTextarea = React.forwardRef<HTMLTextAreaElement, any>((props, ref) => {
    const { label, name, value, onChange, placeholder, rows = 4, ...rest } = props;
    return (
      <FormControl>
        {label && <FormLabel>{label}</FormLabel>}
        <Textarea
          ref={ref}
          name={name}
          value={value || ''}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange?.(e.target.value)}
          data-test-id={name}
          {...rest}
        />
      </FormControl>
    );
  });