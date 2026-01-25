/**
 * @schepta/factory-vue
 * 
 * Vue factories for schepta rendering engine
 */

// Main factory
export {
  createFormFactory,
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

