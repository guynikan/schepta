import { createComponentSpec } from "@schepta/core";
import { InputText } from "./Inputs/InputText";
import { InputSelect } from "./Inputs/InputSelect";
import { InputCheckbox } from "./Inputs/InputCheckbox";
import { InputTextarea } from "./Inputs/InputTextarea";
import { InputNumber } from "./Inputs/InputNumber";
import { InputDate } from "./Inputs/InputDate";
import { SubmitButton } from "./SubmitButton";
import { FormContainer } from "./Containers/FormContainer";
import { FormField } from "./Containers/FormField";
import { FormSectionContainer } from "./Containers/FormSectionContainer";
import { FormSectionTitle } from "./Containers/FormSectionTitle";
import { FormSectionGroupContainer } from "./Containers/FormSectionGroupContainer";
import { FormSectionGroup } from "./Containers/FormSectionGroup";

export const components = {
  'FormContainer': createComponentSpec({
    id: "FormContainer",
    type: "FormContainer",
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