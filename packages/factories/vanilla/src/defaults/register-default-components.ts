/**
 * Register default components for Vanilla factory
 */

import { setFactoryDefaultComponents, createComponentSpec } from '@schepta/core';
import { createDefaultFormContainer } from '../components/DefaultFormContainer';
import { createDefaultSubmitButton } from '../components/DefaultSubmitButton';
import { createFormField } from '../components/FormField';
import { createFormSectionContainer } from '../components/FormSectionContainer';
import { createFormSectionTitle } from '../components/FormSectionTitle';
import { createFormSectionGroup } from '../components/FormSectionGroup';
import { createFormSectionGroupContainer } from '../components/FormSectionGroupContainer';
import { createInputText } from '../components/InputText';
import { createInputSelect } from '../components/InputSelect';
import { createInputCheckbox } from '../components/InputCheckbox';
import { createInputDate } from '../components/InputDate';
import { createInputPhone } from '../components/InputPhone';
import { createInputNumber } from '../components/InputNumber';
import { createInputTextarea } from '../components/InputTextarea';
import { createInputAutocomplete } from '../components/InputAutocomplete';

/**
 * Register all default Vanilla components with the core registry
 */
export function registerDefaultComponents() {
  setFactoryDefaultComponents({
    FormContainer: createComponentSpec({
      id: 'FormContainer-vanilla',
      type: 'container',
      component: () => createDefaultFormContainer,
    }),
    SubmitButton: createComponentSpec({
      id: 'SubmitButton-vanilla',
      type: 'content',
      component: () => createDefaultSubmitButton,
    }),
    FormField: createComponentSpec({
      id: 'FormField-vanilla',
      type: 'container',
      component: () => createFormField,
    }),
    FormSectionContainer: createComponentSpec({
      id: 'FormSectionContainer-vanilla',
      type: 'container',
      component: () => createFormSectionContainer,
    }),
    FormSectionTitle: createComponentSpec({
      id: 'FormSectionTitle-vanilla',
      type: 'content',
      component: () => createFormSectionTitle,
    }),
    FormSectionGroup: createComponentSpec({
      id: 'FormSectionGroup-vanilla',
      type: 'container',
      component: () => createFormSectionGroup,
    }),
    FormSectionGroupContainer: createComponentSpec({
      id: 'FormSectionGroupContainer-vanilla',
      type: 'container',
      component: () => createFormSectionGroupContainer,
    }),
    InputText: createComponentSpec({
      id: 'InputText-vanilla',
      type: 'field',
      component: () => createInputText,
    }),
    InputSelect: createComponentSpec({
      id: 'InputSelect-vanilla',
      type: 'field',
      component: () => createInputSelect,
    }),
    InputCheckbox: createComponentSpec({
      id: 'InputCheckbox-vanilla',
      type: 'field',
      component: () => createInputCheckbox,
    }),
    InputDate: createComponentSpec({
      id: 'InputDate-vanilla',
      type: 'field',
      component: () => createInputDate,
    }),
    InputPhone: createComponentSpec({
      id: 'InputPhone-vanilla',
      type: 'field',
      component: () => createInputPhone,
    }),
    InputNumber: createComponentSpec({
      id: 'InputNumber-vanilla',
      type: 'field',
      component: () => createInputNumber,
    }),
    InputTextarea: createComponentSpec({
      id: 'InputTextarea-vanilla',
      type: 'field',
      component: () => createInputTextarea,
    }),
    InputAutocomplete: createComponentSpec({
      id: 'InputAutocomplete-vanilla',
      type: 'field',
      component: () => createInputAutocomplete,
    }),
  });
}
