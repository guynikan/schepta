/**
 * @schepta/factory-vue
 *
 * Vue factories for schepta rendering engine.
 * API aligned with @schepta/factory-react.
 */

export {
  FormFactory,
  type FormFactoryProps,
  type FormFactoryRef,
} from './form-factory';

export {
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
} from './components';

export { DefaultFieldRenderer } from './renderers/DefaultFieldRenderer';

export {
  ScheptaFormProvider,
  useScheptaFormAdapter,
  useScheptaFormValues,
  useScheptaFieldValue,
  type ScheptaFormProviderProps,
} from './context/schepta-form-context';

export { FormRenderer } from './form-renderer';
