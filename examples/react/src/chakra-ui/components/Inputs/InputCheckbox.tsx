import React from "react";
import { Checkbox } from "@chakra-ui/react";

export const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, checked, onChange, ...rest } = props;
    return (
      <Checkbox
        ref={ref}
        name={name}
        isChecked={checked || false}
        onChange={(e) => onChange?.(e.target.checked)}
        data-test-id={name}
        {...rest}
      >
        {label}
      </Checkbox>
    );
  });