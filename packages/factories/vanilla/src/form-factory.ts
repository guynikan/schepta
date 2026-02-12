/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult, FormAdapter, MiddlewareFn } from '@schepta/core';
import { createVanillaRuntimeAdapter } from '@schepta/adapter-vanilla';
import { createVanillaFormAdapter } from '@schepta/adapter-vanilla';
import { getScheptaContext } from '@schepta/adapter-vanilla';
import { 
  createComponentOrchestrator,
  createTemplateExpressionMiddleware,
  createSchemaValidator,
  formatValidationErrors,
  getFactoryDefaultComponents,
  getFactoryDefaultRenderers,
} from '@schepta/core';
import { buildInitialValues } from '@schepta/core';
import formSchemaDefinition from '../../src/schemas/form-schema.json';
import { renderForm } from './form-renderer';
import { registerDefaultComponents } from './defaults/register-default-components';
import { registerDefaultRenderers } from './defaults/register-default-renderers';

export interface FormFactoryOptions {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  middlewares?: MiddlewareFn[];
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
  // Register default components and renderers
  registerDefaultComponents();
  
  // Validate schema
  let validation: { valid: boolean; errors?: any[] };
  try {
    const validator = createSchemaValidator(formSchemaDefinition as object, { throwOnError: false });
    validation = validator(options.schema);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    validation = {
      valid: false,
      errors: [{ message: `Schema compilation error: ${msg}` }],
    };
  }
  
  if (!validation.valid) {
    console.error('Schema validation failed:', validation.errors);
    const errorDiv = document.createElement('div');
    errorDiv.style.color = '#dc2626';
    errorDiv.style.padding = '16px';
    errorDiv.style.background = '#fee2e2';
    errorDiv.style.border = '1px solid #fecaca';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.marginBottom = '16px';
    errorDiv.innerHTML = `
      <h3 style="margin-top: 0;">Schema Validation Error</h3>
      <pre style="white-space: pre-wrap; font-size: 13px;">${formatValidationErrors(validation.errors || [])}</pre>
    `;
    options.container.appendChild(errorDiv);
    
    // Return empty form factory result
    const emptyAdapter = createVanillaFormAdapter({});
    return {
      formAdapter: emptyAdapter,
      submit: () => {},
      reset: () => {},
      getValues: () => ({}),
      destroy: () => {
        options.container.innerHTML = '';
      },
    };
  }
  
  // Build initial values
  const defaultValues = options.initialValues || buildInitialValues(options.schema);
  
  // Create form adapter
  const formAdapter = createVanillaFormAdapter(defaultValues);
  
  // Register default renderers with adapter
  registerDefaultRenderers(formAdapter);
  
  // Get provider config (optional - returns null if no provider)
  const providerConfig = getScheptaContext(options.container);
  
  // Merge: local props > provider config > defaults
  const mergedComponents = {
    ...getFactoryDefaultComponents(),
    ...(providerConfig?.components || {}),
    ...(options.components || {}),
    ...(options.customComponents || {}),
  };
  const mergedRenderers = {
    ...getFactoryDefaultRenderers(),
    ...(providerConfig?.renderers || {}),
    ...(options.renderers || {}),
  };
  // Preserve getters/setters in externalContext using Object.defineProperties
  const mergedExternalContext: Record<string, any> = {};
  
  // Copy provider context first
  if (providerConfig?.externalContext) {
    Object.keys(providerConfig.externalContext).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(providerConfig.externalContext, key);
      if (descriptor) {
        Object.defineProperty(mergedExternalContext, key, descriptor);
      }
    });
  }
  
  // Then copy options context (overrides provider)
  if (options.externalContext) {
    Object.keys(options.externalContext).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(options.externalContext, key);
      if (descriptor) {
        Object.defineProperty(mergedExternalContext, key, descriptor);
      }
    });
  }
  
  // Add onSubmit
  if (options.onSubmit) {
    mergedExternalContext.onSubmit = options.onSubmit;
  }
  const mergedDebug = options.debug !== undefined 
    ? options.debug 
    : (providerConfig?.debug?.enabled || false);
  
  // Create runtime adapter
  const runtime = createVanillaRuntimeAdapter();

  const getFactorySetup = (): FactorySetupResult => {
    const formValues = formAdapter.getValues();
    
    // Debug context
    const debugContext = mergedDebug ? {
      isEnabled: true,
      log: (category: string, message: string, data?: any) => {
        console.log(`[${category}]`, message, data);
      },
      buffer: {
        add: () => {},
        clear: () => {},
        getAll: () => [],
      },
    } : undefined;
    
    // Create middlewares with template expressions
    const templateMiddleware = createTemplateExpressionMiddleware({
      formValues,
      externalContext: mergedExternalContext,
      debug: debugContext,
      formAdapter,
    });
    
    const middlewares = [
      templateMiddleware,
      ...(providerConfig?.middlewares || []),
      ...(options.middlewares || []),
    ];
    
    return {
      components: mergedComponents,
      customComponents: options.customComponents,
      renderers: mergedRenderers,
      externalContext: mergedExternalContext,
      state: formValues,
      middlewares,
      onSubmit: options.onSubmit ? () => formAdapter.handleSubmit(options.onSubmit!)() : undefined,
      debug: debugContext,
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

