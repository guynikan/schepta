import { createComponentSpec } from '@schepta/core';
import {
  InputText,
  FormField,
  FormSectionContainer,
  FormSectionTitle,
  FormSectionGroupContainer,
  FormSectionGroup,
  SubmitButton,
  FormContainer,
} from './FormComponents';

// Global components from provider
export const globalComponents = {
  'FormContainer': createComponentSpec({ id: 'FormContainer', type: 'FormContainer', factory: (props, runtime) => FormContainer }),
  InputText: createComponentSpec({ id: 'InputText', type: 'field', factory: (props, runtime) => InputText }),
  FormField: createComponentSpec({ id: 'FormField', type: 'container', factory: (props, runtime) => FormField }),
  FormSectionContainer: createComponentSpec({ id: 'FormSectionContainer', type: 'container', factory: (props, runtime) => FormSectionContainer }),
  FormSectionTitle: createComponentSpec({ id: 'FormSectionTitle', type: 'content', factory: (props, runtime) => FormSectionTitle }),
  FormSectionGroupContainer: createComponentSpec({ id: 'FormSectionGroupContainer', type: 'container', factory: (props, runtime) => FormSectionGroupContainer }),
  FormSectionGroup: createComponentSpec({ id: 'FormSectionGroup', type: 'container', factory: (props, runtime) => FormSectionGroup }),
  SubmitButton: createComponentSpec({ id: 'SubmitButton', type: 'content', factory: (props, runtime) => SubmitButton }),
};

