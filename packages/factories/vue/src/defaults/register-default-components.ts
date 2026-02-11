import { createComponentSpec } from '@schepta/core';
import {
  DefaultFormContainer,
  DefaultFormField,
  DefaultFormSectionContainer,
  DefaultFormSectionGroup,
  DefaultFormSectionGroupContainer,
  DefaultFormSectionTitle,
  DefaultInputAutocomplete,
  DefaultInputCheckbox,
  DefaultInputDate,
  DefaultInputNumber,
  DefaultInputPhone,
  DefaultInputSelect,
  DefaultInputText,
  DefaultInputTextarea,
  DefaultSubmitButton,
} from '../components';

export const defaultComponents = {
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'container',
    component: () => DefaultFormContainer,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'button',
    component: () => DefaultSubmitButton,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    component: () => DefaultInputText,
  }),
  InputSelect: createComponentSpec({
    id: 'InputSelect',
    type: 'field',
    component: () => DefaultInputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox',
    type: 'field',
    component: () => DefaultInputCheckbox,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate',
    type: 'field',
    component: () => DefaultInputDate,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone',
    type: 'field',
    component: () => DefaultInputPhone,
  }),
  InputAutocomplete: createComponentSpec({
    id: 'InputAutocomplete',
    type: 'field',
    component: () => DefaultInputAutocomplete,
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea',
    type: 'field',
    component: () => DefaultInputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber',
    type: 'field',
    component: () => DefaultInputNumber,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    component: () => DefaultFormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    component: () => DefaultFormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    component: () => DefaultFormSectionTitle,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup',
    type: 'container',
    component: () => DefaultFormSectionGroup,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer',
    type: 'container',
    component: () => DefaultFormSectionGroupContainer,
  }),
};
