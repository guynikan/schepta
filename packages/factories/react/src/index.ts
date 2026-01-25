/**
 * @schepta/factory-react
 * 
 * React factories for schepta rendering engine.
 * No external form library dependencies (react-hook-form, formik, etc.)
 * 
 * Users can integrate form libraries by creating custom components.
 * See examples/react/src/basic-ui/components/rhf/ for RHF integration.
 * See examples/react/src/basic-ui/components/formik/ for Formik integration.
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
