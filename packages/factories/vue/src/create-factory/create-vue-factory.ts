/**
 * createVueFactory
 *
 * Generic HOF producing a Vue `defineComponent` wrapper that validates the
 * schema instance, merges factory defaults + provider config + local props,
 * invokes the factory-specific `useSetup`, and renders via Schepta's
 * framework-agnostic component orchestrator.
 */

import { defineComponent, computed, h, ref } from 'vue';
import {
  createComponentOrchestrator,
  createTemplateExpressionMiddleware,
  createSchemaValidator,
  formatValidationErrors,
  type FactorySetupResult,
  type DebugContextValue,
} from '@schepta/core';
import { createVueRuntimeAdapter, useScheptaContext } from '@schepta/adapter-vue';
import { FormRenderer } from '../form-renderer';
import type {
  CreateVueFactoryConfig,
  VueFactoryBaseProps,
  VueFactoryMergedConfig,
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

export function createVueFactory<
  TProps extends VueFactoryBaseProps,
  TRefApi = unknown,
  TState extends Record<string, any> = Record<string, any>,
>(config: CreateVueFactoryConfig<TProps, TRefApi, TState>): any {
  const {
    name = 'ScheptaFactory',
    schemaDefinition,
    rootComponentKey,
    defaultComponents,
    defaultRenderers,
    propsDef,
    useSetup,
  } = config;

  return defineComponent({
    name,
    props: propsDef,
    setup(rawProps: any, { expose }) {
      const props = rawProps as TProps;
      const providerConfig = useScheptaContext();

      const mergedConfig = computed<VueFactoryMergedConfig>(() => ({
        components: {
          ...defaultComponents,
          ...(providerConfig?.components || {}),
          ...(props.components || {}),
        },
        customComponents: {
          ...(providerConfig?.customComponents || {}),
          ...(props.customComponents || {}),
        },
        renderers: {
          ...(defaultRenderers || {}),
          ...(providerConfig?.renderers || {}),
          ...(props.renderers || {}),
        },
        externalContext: {
          ...(providerConfig?.externalContext || {}),
          ...(props.externalContext || {}),
        },
        baseMiddlewares: [
          ...(providerConfig?.middlewares || []),
          ...(props.middlewares || []),
        ],
        debug:
          props.debug !== undefined
            ? props.debug
            : providerConfig?.debug?.enabled || false,
      }));

      const validation = computed(() => {
        try {
          const validator = createSchemaValidator(schemaDefinition, { throwOnError: false });
          const result = validator(props.schema);
          return {
            valid: result.valid,
            formattedErrors: result.valid ? '' : formatValidationErrors(result.errors),
          };
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          return {
            valid: false,
            formattedErrors: `Schema compilation error: ${msg}`,
          };
        }
      });

      const setup = useSetup({ props, mergedConfig });

      expose(setup.refApi as any);

      const runtime = ref(createVueRuntimeAdapter());

      const resolvedRootKey = computed(
        () => (props.schema as any)?.['x-component'] || rootComponentKey
      );

      const renderer = computed(() => {
        const cfg = mergedConfig.value;
        const debugContext = createDebugContext(cfg.debug);

        const getFactorySetup = (): FactorySetupResult => {
          const state = setup.getState ? setup.getState() : {};
          const extraCtx = setup.getExternalContext ? setup.getExternalContext() || {} : {};
          const mergedExternalContext = { ...cfg.externalContext, ...extraCtx };

          const templateMiddleware = createTemplateExpressionMiddleware({
            externalContext: mergedExternalContext,
            formValues: state as Record<string, any>,
            debug: debugContext,
          });

          const extraMw = setup.getMiddlewares ? setup.getMiddlewares() || [] : [];
          const middlewares = [templateMiddleware, ...extraMw, ...cfg.baseMiddlewares];

          return {
            components: cfg.components,
            customComponents: cfg.customComponents,
            renderers: cfg.renderers,
            externalContext: mergedExternalContext,
            state: state as Record<string, any>,
            middlewares,
            onSubmit: setup.getOnSubmit ? setup.getOnSubmit() : undefined,
            debug: debugContext,
            formAdapter: setup.getFormAdapter ? setup.getFormAdapter() : undefined,
            rootComponentKey,
          };
        };

        return createComponentOrchestrator(getFactorySetup, runtime.value);
      });

      return () => {
        if (!validation.value.valid) {
          return h(
            'div',
            {
              style: {
                padding: '16px',
                backgroundColor: 'var(--schepta-error-bg)',
                border: '1px solid var(--schepta-error-border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
              },
            },
            [
              h(
                'h3',
                { style: { color: 'var(--schepta-error-text)', margin: '0 0 12px 0' } },
                'Schema Validation Error'
              ),
              h(
                'pre',
                {
                  style: {
                    whiteSpace: 'pre-wrap',
                    fontSize: '12px',
                    margin: 0,
                    color: 'var(--schepta-error-text-muted)',
                  },
                },
                validation.value.formattedErrors
              ),
            ]
          );
        }

        const tree = h(FormRenderer, {
          componentKey: resolvedRootKey.value,
          schema: props.schema,
          renderer: renderer.value,
        });

        return setup.wrap ? setup.wrap(tree) : tree;
      };
    },
  });
}
