/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult, FormAdapter } from '@schepta/core';
import { createVanillaRuntimeAdapter } from '@schepta/adapter-vanilla';
import { createVanillaFormAdapter } from '@schepta/adapter-vanilla';
import { getScheptaContext } from '@schepta/adapter-vanilla';
import { createRendererOrchestrator } from '@schepta/core';
import { buildInitialValuesFromSchema } from '@schepta/core';
import { renderForm } from './form-renderer';

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

/**
 * Creates a default submit button element
 */
function createDefaultSubmitButton(onClick: () => void): HTMLElement {
  const container = document.createElement('div');
  container.style.marginTop = '24px';
  container.style.textAlign = 'right';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Submit';
  button.dataset.testId = 'submit-button';
  button.style.padding = '12px 24px';
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '16px';
  button.style.fontWeight = '500';
  button.addEventListener('click', onClick);

  container.appendChild(button);
  return container;
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
    options.initialValues || buildInitialValuesFromSchema(options.schema)
  );
  const runtime = createVanillaRuntimeAdapter();

  const getFactorySetup = (): FactorySetupResult => {
    return {
      components: mergedComponents,
      renderers: mergedRenderers,
      externalContext: mergedExternalContext,
      state: formAdapter.getValues(),
      middlewares: mergedMiddlewares,
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

  const renderer = createRendererOrchestrator(getFactorySetup, runtime);
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

  // If onSubmit is provided, render SubmitButton
  if (options.onSubmit) {
    // Check if custom SubmitButton component is registered
    const customSubmitButton = mergedComponents.SubmitButton?.factory?.({}, runtime);
    
    if (customSubmitButton && typeof customSubmitButton === 'function') {
      // Use custom component - assume it returns an HTMLElement
      const customElement = customSubmitButton({ 
        onSubmit: () => formAdapter.handleSubmit(options.onSubmit!)() 
      });
      if (customElement instanceof HTMLElement) {
        options.container.appendChild(customElement);
      }
    } else {
      // Use default submit button
      const submitButton = createDefaultSubmitButton(() => {
        formAdapter.handleSubmit(options.onSubmit!)();
      });
      options.container.appendChild(submitButton);
    }
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

