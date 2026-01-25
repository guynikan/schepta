/**
 * @schepta/factory-react
 * 
 * React factories for schepta rendering engine
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
  type FormContainerProps,
  type SubmitButtonProps,
  type SubmitButtonComponentType,
} from './components';

// Hooks (for advanced usage)
export * from './hooks';

// Renderers (for customization)
export * from './renderers';

// Utilities
export * from './utils';

// Re-export internal components for advanced usage
export { FormRenderer } from './form-renderer';
export { FieldWrapper } from './field-wrapper';
