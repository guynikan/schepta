/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult } from '@schepta/core';
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

export function createFormFactory(options: FormFactoryOptions) {
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
  const rootComponentKey = (options.schema as any)['x-component'] || 'form-container';

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
    destroy: () => {
      options.container.innerHTML = '';
    },
  };
}

