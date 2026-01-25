/**
 * @schepta/factory-vanilla
 * 
 * Vanilla JS factories for schepta rendering engine
 */

// Main factory
export {
  createFormFactory,
  type FormFactoryOptions,
  type FormFactoryResult,
} from './form-factory';

// Components (types and defaults)
export {
  createDefaultFormContainer,
  createDefaultSubmitButton,
  type FormContainerProps,
  type SubmitButtonProps,
  type SubmitButtonFactory,
} from './components';

