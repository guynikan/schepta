import { createComponentSpec } from "@schepta/core";
import { InputText } from "./components/Inputs/InputText";
import { InputSelect } from "./components/Inputs/InputSelect";
import { InputCheckbox } from "./components/Inputs/InputCheckbox";
import { InputTextarea } from "./components/Inputs/InputTextarea";
import { InputNumber } from "./components/Inputs/InputNumber";
import { InputDate } from "./components/Inputs/InputDate";
import { SubmitButton } from "./components/SubmitButton";
import { FormContainer } from "./components/Containers/FormContainer";
import { FormField } from "./components/Containers/FormField";
import { FormSectionContainer } from "./components/Containers/FormSectionContainer";
import { FormSectionTitle } from "./components/Containers/FormSectionTitle";
import { FormSectionGroupContainer } from "./components/Containers/FormSectionGroupContainer";
import { FormSectionGroup } from "./components/Containers/FormSectionGroup";

export const components = {
  'form-container': createComponentSpec({
    id: "form-container",
    type: "form-container",
    factory: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: "InputText",
    type: "field",
    factory: (props, runtime) => InputText,
  }),
  InputSelect: createComponentSpec({
    id: "InputSelect",
    type: "field",
    factory: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: "InputCheckbox",
    type: "field",
    factory: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: "InputPhone",
    type: "field",
    factory: (props, runtime) => InputText,
    defaultProps: { type: "tel" },
  }),
  InputTextarea: createComponentSpec({
    id: "InputTextarea",
    type: "field",
    factory: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: "InputNumber",
    type: "field",
    factory: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: "InputDate",
    type: "field",
    factory: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: "SubmitButton",
    type: 'content',
    factory: (props, runtime) => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: "FormField",
    type: 'container',
    factory: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: "FormSectionContainer",
    type: "container",
    factory: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: "FormSectionTitle",
    type: 'content',
    factory: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: "FormSectionGroupContainer",
    type: 'container',
    factory: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: "FormSectionGroup",
    type: 'container',
    factory: (props, runtime) => FormSectionGroup,
  }),
};