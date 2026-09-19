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
  type FormFactoryApi,
} from './form-factory';

// Factory primitive for building custom vanilla factories
export {
  createVanillaFactory,
  type CreateVanillaFactoryConfig,
  type VanillaFactoryBaseApi,
  type VanillaFactoryBaseOptions,
  type VanillaFactoryMergedConfig,
  type VanillaFactorySetupContext,
  type VanillaFactorySetupFn,
  type VanillaFactorySetupReturn,
} from './create-factory';

// Components (types and defaults)
export {
  createDefaultFormContainer,
  createDefaultSubmitButton,
  type FormContainerProps,
  type SubmitButtonProps,
  type SubmitButtonFactory,
} from './components';

