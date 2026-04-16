/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult, FormAdapter, MiddlewareFn } from '@schepta/core';
import { createVanillaRuntimeAdapter, VanillaFormAdapter } from '@schepta/adapter-vanilla';
import { createVanillaFormAdapter } from '@schepta/adapter-vanilla';
import { getScheptaContext } from '@schepta/adapter-vanilla';
import {
  createComponentOrchestrator,
  createTemplateExpressionMiddleware,
  createSchemaValidator,
  formatValidationErrors,
  getFactoryDefaultComponents,
  hasFormValueTemplates,
} from '@schepta/core';
import { buildInitialValues } from '@schepta/core';
import formSchemaDefinition from "@schepta/factories/schemas/form-schema.json";
import { renderForm } from './form-renderer';
import { registerDefaultComponents } from './defaults/register-default-components';
import { createDefaultRenderers } from './defaults/register-default-renderers';
import { injectScheptaTokens } from './schepta-tokens';

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
  injectScheptaTokens();

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
    errorDiv.style.color = 'var(--schepta-error-text)';
    errorDiv.style.padding = '16px';
    errorDiv.style.background = 'var(--schepta-error-bg)';
    errorDiv.style.border = '1px solid var(--schepta-error-border)';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.marginBottom = '16px';
    errorDiv.innerHTML = `
      <h3 style="margin-top: 0;">Schema Validation Error</h3>
      <pre style="white-space: pre-wrap; font-size: 13px;">${formatValidationErrors(validation.errors || [])}</pre>
    `;
    options.container.appendChild(errorDiv);

    const emptyAdapter = createVanillaFormAdapter({});
    return {
      formAdapter: emptyAdapter,
      submit: () => {},
      reset: () => {},
      getValues: () => ({}),
      destroy: () => { options.container.innerHTML = ''; },
    };
  }

  // Build initial values
  const defaultValues = options.initialValues || buildInitialValues(options.schema);

  // Create form adapter
  const formAdapter = createVanillaFormAdapter(defaultValues);

  // Create default renderers with adapter
  const defaultRenderers = createDefaultRenderers(formAdapter);

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
    ...defaultRenderers,
    ...(providerConfig?.renderers || {}),
    ...(options.renderers || {}),
  };

  // Preserve getters/setters in externalContext using Object.defineProperties
  const mergedExternalContext: Record<string, any> = {};

  if (providerConfig?.externalContext) {
    Object.keys(providerConfig.externalContext).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(providerConfig.externalContext, key);
      if (descriptor) Object.defineProperty(mergedExternalContext, key, descriptor);
    });
  }

  if (options.externalContext) {
    Object.keys(options.externalContext).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(options.externalContext, key);
      if (descriptor) Object.defineProperty(mergedExternalContext, key, descriptor);
    });
  }

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

    const debugContext = mergedDebug ? {
      isEnabled: true,
      log: (category: string, message: string, data?: any) => {
        console.log(`[${category}]`, message, data);
      },
      buffer: { add: () => {}, clear: () => {}, getAll: () => [] },
    } : undefined;

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

  // Track the currently mounted form element so we can replace just it
  // (not the entire container which may hold other content like info boxes)
  let currentFormElement: HTMLElement | null = null;

  const mountForm = () => {
    const formElement = renderForm({
      componentKey: rootComponentKey,
      schema: options.schema,
      renderer,
      formAdapter,
      onSubmit: options.onSubmit,
    });

    if (formElement && 'element' in formElement) {
      if (currentFormElement && options.container.contains(currentFormElement)) {
        options.container.replaceChild(formElement.element, currentFormElement);
      } else {
        options.container.appendChild(formElement.element);
      }
      currentFormElement = formElement.element;
    }
  };

  // Initial render
  mountForm();

  // --- Reactive render loop ---
  // Only activated when the schema contains {{ $formValues.* }} templates.
  // For static schemas this is a no-op — zero overhead.
  let rafId: number | null = null;
  let unsubscribeChange: (() => void) | null = null;

  if (hasFormValueTemplates(options.schema) && formAdapter instanceof VanillaFormAdapter) {
    /**
     * Schedule a re-render on the next animation frame.
     * Multiple value changes within the same frame are batched into one render.
     */
    const scheduleRerender = () => {
      if (rafId !== null) return; // already queued

      rafId = requestAnimationFrame(() => {
        rafId = null;

        // Capture active element state before replacing DOM
        const active = document.activeElement as HTMLInputElement | null;
        const isInsideForm = active !== null && currentFormElement?.contains(active);
        const activeName = isInsideForm ? (active.getAttribute('name') ?? null) : null;
        const activeValue = isInsideForm ? (active.value ?? null) : null;

        // Replace the form subtree with a freshly rendered one
        mountForm();

        // Restore focus and value so the user's typing continues uninterrupted
        if (activeName && currentFormElement) {
          const restored = currentFormElement.querySelector<HTMLElement>(
            `[name="${activeName}"]`
          );
          if (restored) {
            restored.focus();
            // Restore in-progress input value (adapter already has the committed
            // value, but the input may contain partially typed text not yet saved)
            if (activeValue !== null && 'value' in restored) {
              (restored as HTMLInputElement).value = activeValue;
            }
          }
        }
      });
    };

    // Subscribe to every setValue and reset via VanillaFormAdapter's listener system
    const unsubChange = formAdapter.subscribe(scheduleRerender);
    const unsubReset = formAdapter.onReset(scheduleRerender);
    unsubscribeChange = () => { unsubChange(); unsubReset(); };
  }

  const destroy = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (unsubscribeChange) {
      unsubscribeChange();
      unsubscribeChange = null;
    }
    options.container.innerHTML = '';
    currentFormElement = null;
  };

  return {
    formAdapter,
    submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
    // reset is handled reactively via onReset subscription above — no extra logic needed
    reset: (values) => formAdapter.reset(values),
    getValues: () => formAdapter.getValues(),
    destroy,
  };
}
