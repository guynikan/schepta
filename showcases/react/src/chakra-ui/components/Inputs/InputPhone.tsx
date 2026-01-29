import React from "react";
import { InputText } from "./InputText";
import { InputProps } from "@chakra-ui/react";
import type { InputPhoneProps } from "@schepta/factory-react";

export const InputPhone: React.FC<InputPhoneProps & InputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  ...rest
}) => {
  return (
    <InputText
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      {...rest}
    />
  );
};
