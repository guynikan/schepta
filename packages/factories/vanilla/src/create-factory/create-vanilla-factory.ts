/**
 * createVanillaFactory
 *
 * Generic HOF that builds a vanilla-JS factory function. Handles:
 *   - Schema validation
 *   - Merge of factory defaults + provider context + local options
 *   - Orchestrator construction
 *   - Initial mount + optional RAF-batched reactive re-render loop
 *   - Cleanup / destroy lifecycle
 *
 * The factory-specific `setup` callback returns the state getter, optional
 * subscription source, imperative API surface, and optional pre/post re-render
 * hooks (e.g. to preserve form focus across DOM replacement).
 */

import {
  createComponentOrchestrator,
  createTemplateExpressionMiddleware,
  createSchemaValidator,
  formatValidationErrors,
  type FactorySetupResult,
  type DebugContextValue,
} from '@schepta/core';
import { createVanillaRuntimeAdapter, getScheptaContext, type DOMElement } from '@schepta/adapter-vanilla';
import type {
  CreateVanillaFactoryConfig,
  VanillaFactoryBaseApi,
  VanillaFactoryBaseOptions,
  VanillaFactoryMergedConfig,
} from './types';

function createDebugContext(enabled: boolean): DebugContextValue | undefined {
  if (!enabled) return undefined;
  return {
    isEnabled: true,
    log: (category, message, data) => {
      console.log(`[${category}]`, message, data);
    },
    buffer: { add: () => {}, clear: () => {}, getAll: () => [] },
  };
}

function renderValidationError(container: HTMLElement, errors: any[]): void {
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'var(--schepta-error-text)';
  errorDiv.style.padding = '16px';
  errorDiv.style.background = 'var(--schepta-error-bg)';
  errorDiv.style.border = '1px solid var(--schepta-error-border)';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.marginBottom = '16px';

  const title = document.createElement('h3');
  title.style.marginTop = '0';
  title.textContent = 'Schema Validation Error';

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.fontSize = '13px';
  pre.textContent = formatValidationErrors(errors);

  errorDiv.appendChild(title);
  errorDiv.appendChild(pre);
  container.appendChild(errorDiv);
}

function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Merge external context objects while preserving getter/setter descriptors.
 * Needed because some vanilla consumers define `externalContext` with accessors
 * (e.g. reactive toggles) and a plain spread would collapse them to values.
 */
function mergeExternalContext(
  base: Record<string, any>,
  extras: Array<Record<string, any> | undefined>
): Record<string, any> {
  const out: Record<string, any> = {};
  const sources = [base, ...extras.filter((x): x is Record<string, any> => Boolean(x))];
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor) {
        Object.defineProperty(out, key, descriptor);
      }
    }
  }
  return out;
}

export function createVanillaFactory<
  TOptions extends VanillaFactoryBaseOptions,
  TApi,
>(
  config: CreateVanillaFactoryConfig<TOptions, TApi>
): (options: TOptions) => TApi & VanillaFactoryBaseApi {
  const {
    schemaDefinition,
    rootComponentKey,
    defaultComponents,
    createDefaultRenderers,
    setup,
  } = config;

  return function createFactoryInstance(options: TOptions): TApi & VanillaFactoryBaseApi {
    let validation: { valid: boolean; errors?: any[] };
    try {
      const validator = createSchemaValidator(schemaDefinition, { throwOnError: false });
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
      renderValidationError(options.container, validation.errors || []);
      return {
        destroy: () => {
          clearContainer(options.container);
        },
      } as TApi & VanillaFactoryBaseApi;
    }

    const providerConfig = getScheptaContext(options.container);

    const mergedExternalContext = mergeExternalContext({}, [
      providerConfig?.externalContext,
      options.externalContext,
    ]);

    const mergedConfig: VanillaFactoryMergedConfig = {
      components: {
        ...defaultComponents,
        ...(providerConfig?.components || {}),
        ...(options.components || {}),
        ...(options.customComponents || {}),
      },
      customComponents: options.customComponents,
      renderers: {
        ...(providerConfig?.renderers || {}),
        ...(options.renderers || {}),
      },
      externalContext: mergedExternalContext,
      baseMiddlewares: [
        ...(providerConfig?.middlewares || []),
        ...(options.middlewares || []),
      ],
      debug:
        options.debug !== undefined
          ? options.debug
          : providerConfig?.debug?.enabled || false,
    };

    const setupResult = setup({ options, mergedConfig });

    const resolvedRenderers: Partial<Record<string, any>> = {
      ...(createDefaultRenderers ? createDefaultRenderers(setupResult) : {}),
      ...mergedConfig.renderers,
    };

    if (setupResult.onSubmit && !('onSubmit' in mergedConfig.externalContext)) {
      mergedConfig.externalContext.onSubmit = setupResult.onSubmit;
    }

    const runtime = createVanillaRuntimeAdapter();

    const getFactorySetup = (): FactorySetupResult => {
      const state = setupResult.getState();
      const debugContext = createDebugContext(mergedConfig.debug);

      const finalExternalContext = setupResult.externalContext
        ? mergeExternalContext(mergedConfig.externalContext, [setupResult.externalContext])
        : mergedConfig.externalContext;

      const templateMiddleware = createTemplateExpressionMiddleware({
        externalContext: finalExternalContext,
        formValues: state,
        debug: debugContext,
        formAdapter: setupResult.formAdapter,
      });

      const middlewares = [
        templateMiddleware,
        ...(setupResult.middlewares || []),
        ...mergedConfig.baseMiddlewares,
      ];

      return {
        components: mergedConfig.components,
        customComponents: mergedConfig.customComponents,
        renderers: resolvedRenderers,
        externalContext: finalExternalContext,
        state,
        middlewares,
        onSubmit: setupResult.onSubmit
          ? () => setupResult.onSubmit!(setupResult.getState())
          : undefined,
        debug: debugContext,
        formAdapter: setupResult.formAdapter,
        rootComponentKey,
      };
    };

    const renderer = createComponentOrchestrator(getFactorySetup, runtime);
    const resolvedRootKey = (options.schema as any)['x-component'] || rootComponentKey;

    // Track the currently mounted root element so reactive re-renders can
    // replace just it (not the whole container, which may hold other content).
    let currentRoot: HTMLElement | null = null;

    const mount = (): void => {
      const result = renderer(resolvedRootKey, options.schema);
      const domResult = result as DOMElement | null;

      if (!domResult || !('element' in domResult)) return;

      if (currentRoot && options.container.contains(currentRoot)) {
        options.container.replaceChild(domResult.element, currentRoot);
      } else {
        options.container.appendChild(domResult.element);
      }
      currentRoot = domResult.element as HTMLElement;
    };

    mount();

    let rafId: number | null = null;
    let unsubscribe: (() => void) | null = null;

    if (setupResult.subscribe) {
      const scheduleRerender = (): void => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const snapshot = setupResult.onBeforeRerender
            ? setupResult.onBeforeRerender(currentRoot)
            : undefined;
          mount();
          if (setupResult.onAfterRerender) {
            setupResult.onAfterRerender(currentRoot, snapshot);
          }
        });
      };
      unsubscribe = setupResult.subscribe(scheduleRerender);
    }

    const destroy = (): void => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (setupResult.onDestroy) {
        setupResult.onDestroy();
      }
      clearContainer(options.container);
      currentRoot = null;
    };

    return {
      ...setupResult.api,
      destroy,
    } as TApi & VanillaFactoryBaseApi;
  };
}
