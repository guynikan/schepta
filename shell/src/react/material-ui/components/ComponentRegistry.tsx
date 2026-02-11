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
    id: "FormContainer-material-ui",
    type: "container",
    component: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: "InputText-material-ui",
    type: "field",
    component: (props, runtime) => InputText,
  }),
  InputSelect: createComponentSpec({
    id: "InputSelect-material-ui",
    type: "field",
    component: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: "InputCheckbox-material-ui",
    type: "field",
    component: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: "InputPhone-material-ui",
    type: "field",
    component: (props, runtime) => InputText,
    defaultProps: { type: "tel" },
  }),
  InputTextarea: createComponentSpec({
    id: "InputTextarea-material-ui",
    type: "field",
    component: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: "InputNumber-material-ui",
    type: "field",
    component: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: "InputDate-material-ui",
    type: "field",
    component: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: "SubmitButton-material-ui",
    type: 'content',
    component: (props, runtime) => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: "FormField-material-ui",
    type: 'container',
    component: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: "FormSectionContainer-material-ui",
    type: "container",
    component: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: "FormSectionTitle-material-ui",
    type: 'content',
    component: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: "FormSectionGroupContainer-material-ui",
    type: 'container',
    component: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: "FormSectionGroup-material-ui",
    type: 'container',
    component: (props, runtime) => FormSectionGroup,
  }),
};