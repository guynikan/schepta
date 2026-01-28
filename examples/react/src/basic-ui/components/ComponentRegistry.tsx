import { createComponentSpec } from "@schepta/core";
import { InputText } from "./Inputs/InputText";

export const components = {
  InputText: createComponentSpec({
    id: "InputText",
    type: "field",
    factory: (props, runtime) => InputText,
  }),
};