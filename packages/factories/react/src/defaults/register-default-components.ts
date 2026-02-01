import { ComponentSpec, createComponentSpec } from "@schepta/core";
import {
    DefaultFieldWrapper,
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
    DefaultSubmitButton
} from "../components";

export const defaultComponents: Record<string, ComponentSpec> = {
    FormContainer: createComponentSpec({
        id: 'FormContainer',
        type: 'container',
        factory: () => DefaultFormContainer,
    }),
    SubmitButton: createComponentSpec({
        id: 'SubmitButton',
        type: 'content',
        factory: () => DefaultSubmitButton,
    }),
    FieldWrapper: createComponentSpec({
        id: 'FieldWrapper',
        type: 'field-wrapper',
        factory: () => DefaultFieldWrapper,
    }),
    // Input components
    InputText: createComponentSpec({
        id: 'InputText',
        type: 'field',
        factory: () => DefaultInputText,
    }),
    InputSelect: createComponentSpec({
        id: 'InputSelect',
        type: 'field',
        factory: () => DefaultInputSelect,
    }),
    InputCheckbox: createComponentSpec({
        id: 'InputCheckbox',
        type: 'field',
        factory: () => DefaultInputCheckbox,
    }),
    InputDate: createComponentSpec({
        id: 'InputDate',
        type: 'field',
        factory: () => DefaultInputDate,
    }),
    InputPhone: createComponentSpec({
        id: 'InputPhone',
        type: 'field',
        factory: () => DefaultInputPhone,
    }),
    InputAutocomplete: createComponentSpec({
        id: 'InputAutocomplete',
        type: 'field',
        factory: () => DefaultInputAutocomplete,
    }),
    InputTextarea: createComponentSpec({
        id: 'InputTextarea',
        type: 'field',
        factory: () => DefaultInputTextarea,
    }),
    InputNumber: createComponentSpec({
        id: 'InputNumber',
        type: 'field',
        factory: () => DefaultInputNumber,
    }),
    // Container components
    FormField: createComponentSpec({
        id: 'FormField',
        type: 'container',
        factory: () => DefaultFormField,
    }),
    FormSectionContainer: createComponentSpec({
        id: 'FormSectionContainer',
        type: 'container',
        factory: () => DefaultFormSectionContainer,
    }),
    FormSectionTitle: createComponentSpec({
        id: 'FormSectionTitle',
        type: 'content',
        factory: () => DefaultFormSectionTitle,
    }),
    FormSectionGroup: createComponentSpec({
        id: 'FormSectionGroup',
        type: 'container',
        factory: () => DefaultFormSectionGroup,
    }),
    FormSectionGroupContainer: createComponentSpec({
        id: 'FormSectionGroupContainer',
        type: 'container',
        factory: () => DefaultFormSectionGroupContainer,
    }),

}