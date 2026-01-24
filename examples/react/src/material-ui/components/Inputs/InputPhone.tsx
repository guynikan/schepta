import React from "react";
import { InputText } from "./InputText";

export const InputPhone = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    return <InputText ref={ref} {...props} type="tel" />;
  });