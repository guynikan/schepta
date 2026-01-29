/**
 * @schepta/factory-react
 * 
 * React factories for schepta rendering engine.
 * No external form library dependencies (react-hook-form, formik, etc.)
 * 
 * Users can integrate form libraries by creating custom components.
 * See showcases/react/src/basic-ui/components/rhf/ for RHF integration.
 * See showcases/react/src/basic-ui/components/formik/ for Formik integration.
 */

// Main factory
export {
  FormFactory,
  type FormFactoryProps,
  type FormFactoryRef,
} from './form-factory';

// Components (types and defaults)
export {
  DefaultFormContainer,
  DefaultSubmitButton,
  DefaultFieldWrapper,
  type FormContainerProps,
  type SubmitButtonProps,
  type SubmitButtonComponentType,
  type FieldWrapperProps,
  type FieldWrapperType,
  // Input components
  DefaultInputText,
  DefaultInputSelect,
  DefaultInputCheckbox,
  DefaultInputDate,
  DefaultInputPhone,
  DefaultInputAutocomplete,
  DefaultInputTextarea,
  DefaultInputNumber,
  type InputTextProps,
  type InputTextComponentType,
  type InputSelectProps,
  type InputSelectOption,
  type InputSelectComponentType,
  type InputCheckboxProps,
  type InputCheckboxComponentType,
  type InputDateProps,
  type InputDateComponentType,
  type InputPhoneProps,
  type InputPhoneComponentType,
  type InputAutocompleteProps,
  type InputAutocompleteOption,
  type InputAutocompleteComponentType,
  type InputTextareaProps,
  type InputTextareaComponentType,
  type InputNumberProps,
  type InputNumberComponentType,
  // Container components
  DefaultFormField,
  DefaultFormSectionContainer,
  DefaultFormSectionTitle,
  DefaultFormSectionGroup,
  DefaultFormSectionGroupContainer,
  type FormFieldProps,
  type FormFieldComponentType,
  type FormSectionContainerProps,
  type FormSectionContainerComponentType,
  type FormSectionTitleProps,
  type FormSectionTitleComponentType,
  type FormSectionGroupProps,
  type FormSectionGroupComponentType,
  type FormSectionGroupContainerProps,
  type FormSectionGroupContainerComponentType,
} from './components';

// Context and hooks for form state management
export {
  ScheptaFormProvider,
  useScheptaFormAdapter,
  useScheptaFormValues,
  useScheptaFieldValue,
  type ScheptaFormProviderProps,
} from './context';

// Hooks (for advanced usage)
export * from './hooks';

// Renderers (for customization)
export * from './renderers';

// Utilities
export * from './utils';

// Re-export internal components for advanced usage
export { FormRenderer } from './form-renderer';
