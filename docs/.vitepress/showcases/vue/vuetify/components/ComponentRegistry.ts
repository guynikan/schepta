import { createComponentSpec } from '@schepta/core';
import { InputText } from './Inputs/InputText';
import { InputSelect } from './Inputs/InputSelect';
import { InputCheckbox } from './Inputs/InputCheckbox';
import { InputTextarea } from './Inputs/InputTextarea';
import { InputNumber } from './Inputs/InputNumber';
import { InputDate } from './Inputs/InputDate';
import { SubmitButton } from './SubmitButton';
import { FormContainer } from './Containers/FormContainer';
import { FormField } from './Containers/FormField';
import { FormSectionContainer } from './Containers/FormSectionContainer';
import { FormSectionTitle } from './Containers/FormSectionTitle';
import { FormSectionGroupContainer } from './Containers/FormSectionGroupContainer';
import { FormSectionGroup } from './Containers/FormSectionGroup';

export const components = {
  FormContainer: createComponentSpec({
    id: 'FormContainer-vuetify',
    type: 'container',
    component: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText-vuetify',
    type: 'field',
    component: (props, runtime) => InputText,
  }),
  InputSelect: createComponentSpec({
    id: 'InputSelect-vuetify',
    type: 'field',
    component: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox-vuetify',
    type: 'field',
    component: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone-vuetify',
    type: 'field',
    component: (props, runtime) => InputText,
    defaultProps: { type: 'tel' },
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea-vuetify',
    type: 'field',
    component: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber-vuetify',
    type: 'field',
    component: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate-vuetify',
    type: 'field',
    component: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton-vuetify',
    type: 'content',
    component: (props, runtime) => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: 'FormField-vuetify',
    type: 'container',
    component: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer-vuetify',
    type: 'container',
    component: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle-vuetify',
    type: 'content',
    component: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer-vuetify',
    type: 'container',
    component: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup-vuetify',
    type: 'container',
    component: (props, runtime) => FormSectionGroup,
  }),
};
