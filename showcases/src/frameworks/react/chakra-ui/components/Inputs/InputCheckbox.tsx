import React from "react";
import { Checkbox, CheckboxProps } from "@chakra-ui/react";
import type { InputCheckboxProps } from "@schepta/factory-react";

export const InputCheckbox: React.FC<InputCheckboxProps & CheckboxProps> = ({
  label,
  name,
  value,
  onChange,
  externalContext,
  "x-component-props": xComponentProps,
  "x-ui": xUi,
  ...rest
}) => {
  return (
    <Checkbox
      name={name}
      isChecked={value || false}
      onChange={(e) => onChange?.(e.target.checked)}
      data-test-id={name}
      {...xComponentProps}
      {...rest}
    >
      {label}
    </Checkbox>
  );
};
