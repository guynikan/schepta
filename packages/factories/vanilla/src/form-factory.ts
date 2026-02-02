/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult, FormAdapter } from '@schepta/core';
import { createVanillaRuntimeAdapter } from '@schepta/adapter-vanilla';
import { createVanillaFormAdapter } from '@schepta/adapter-vanilla';
import { getScheptaContext } from '@schepta/adapter-vanilla';
import { 
  createComponentOrchestrator,
  setFactoryDefaultComponents,
  createComponentSpec,
} from '@schepta/core';
import { buildInitialValues } from '@schepta/core';
import { renderForm } from './form-renderer';
import { 
  createDefaultFormContainer, 
  createDefaultSubmitButton
} from './components';

// Register factory default components (called once on module load)
setFactoryDefaultComponents({
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'container',
    factory: () => createDefaultFormContainer,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: () => createDefaultSubmitButton,
  }),
});

export interface FormFactoryOptions {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
  container: HTMLElement;
}

/**
 * Result interface for external form control
 */
export interface FormFactoryResult {
  /** The form adapter for direct access */
  formAdapter: FormAdapter;
  /** Submit the form with the provided handler */
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  /** Reset form to initial or provided values */
  reset: (values?: Record<string, any>) => void;
  /** Get current form values */
  getValues: () => Record<string, any>;
  /** Destroy the form and clean up */
  destroy: () => void;
}

export function createFormFactory(options: FormFactoryOptions): FormFactoryResult {
  // Get provider config (optional - returns null if no provider)
  const providerConfig = getScheptaContext(options.container);
  
  // Merge: local props > provider config > defaults
  const mergedComponents = options.components || providerConfig?.components || {};
  const mergedRenderers = options.renderers || providerConfig?.renderers || {};
  const mergedMiddlewares = providerConfig?.middlewares || [];
  const mergedExternalContext = {
    ...(providerConfig?.externalContext || {}),
    ...(options.externalContext || {}),
  };
  const mergedDebug = options.debug !== undefined 
    ? options.debug 
    : (providerConfig?.debug?.enabled || false);
  
  const formAdapter = createVanillaFormAdapter(
    options.initialValues || buildInitialValues(options.schema)
  );
  const runtime = createVanillaRuntimeAdapter();

  const getFactorySetup = (): FactorySetupResult => {
    return {
      components: mergedComponents,
      renderers: mergedRenderers,
      externalContext: {
        ...mergedExternalContext,
      },
      state: formAdapter.getValues(),
      middlewares: mergedMiddlewares,
      onSubmit: options.onSubmit ? () => formAdapter.handleSubmit(options.onSubmit!)() : undefined,
      debug: mergedDebug ? {
        isEnabled: true,
        log: (category: string, message: string, data?: any) => {
          console.log(`[${category}]`, message, data);
        },
        buffer: {
          add: () => {},
          clear: () => {},
          getAll: () => [],
        },
      } : undefined,
      formAdapter,
    };
  };

  const renderer = createComponentOrchestrator(getFactorySetup, runtime);
  const rootComponentKey = (options.schema as any)['x-component'] || 'FormContainer';

  // Render form
  const formElement = renderForm({
    componentKey: rootComponentKey,
    schema: options.schema,
    renderer,
    formAdapter,
    onSubmit: options.onSubmit,
  });

  // Append to container
  if (formElement instanceof DocumentFragment) {
    options.container.appendChild(formElement);
  } else if (formElement && 'element' in formElement) {
    options.container.appendChild(formElement.element);
  }

  return {
    formAdapter,
    submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
    reset: (values) => formAdapter.reset(values),
    getValues: () => formAdapter.getValues(),
    destroy: () => {
      options.container.innerHTML = '';
    },
  };
}

