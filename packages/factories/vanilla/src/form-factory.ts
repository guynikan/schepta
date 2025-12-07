/**
 * Vanilla JS Form Factory
 */

import type { FormSchema, ComponentSpec, FactorySetupResult } from '@spectra/core';
import { createVanillaRuntimeAdapter } from '@spectra/adapter-vanilla';
import { createVanillaFormAdapter } from '@spectra/adapter-vanilla';
import { createRendererOrchestrator } from '@spectra/core';
import { buildInitialValuesFromSchema } from '@spectra/core';
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
  const formAdapter = createVanillaFormAdapter(
    options.initialValues || buildInitialValuesFromSchema(options.schema)
  );
  const runtime = createVanillaRuntimeAdapter();

  const getFactorySetup = (): FactorySetupResult => {
    return {
      components: options.components || {},
      renderers: options.renderers,
      externalContext: options.externalContext || {},
      state: formAdapter.getValues(),
      middlewares: [],
      debug: options.debug ? {
        isEnabled: true,
        log: (category, message, data) => {
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

