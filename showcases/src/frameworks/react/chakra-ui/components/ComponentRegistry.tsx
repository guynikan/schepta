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
    id: "FormContainer-chakra-ui",
    type: "container",
    component: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: "InputText-chakra-ui",
    type: "field",
    component: (props, runtime) => InputText,
  }),
  InputSelect: createComponentSpec({
    id: "InputSelect-chakra-ui",
    type: "field",
    component: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: "InputCheckbox-chakra-ui",
    type: "field",
    component: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: "InputPhone-chakra-ui",
    type: "field",
    component: (props, runtime) => InputText,
    defaultProps: { type: "tel" },
  }),
  InputTextarea: createComponentSpec({
    id: "InputTextarea-chakra-ui",
    type: "field",
    component: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: "InputNumber-chakra-ui",
    type: "field",
    component: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: "InputDate-chakra-ui",
    type: "field",
    component: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: "SubmitButton-chakra-ui",
    type: 'content',
    component: (props, runtime) => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: "FormField-chakra-ui",
    type: 'container',
    component: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: "FormSectionContainer-chakra-ui",
    type: "container",
    component: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: "FormSectionTitle-chakra-ui",
    type: 'content',
    component: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: "FormSectionGroupContainer-chakra-ui",
    type: 'container',
    component: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: "FormSectionGroup-chakra-ui",
    type: 'container',
    component: (props, runtime) => FormSectionGroup,
  }),
};