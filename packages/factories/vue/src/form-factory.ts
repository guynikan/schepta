/**
 * Vue Form Factory
 *
 * Factory component for rendering forms from JSON schemas.
 * API aligned with React FormFactory.
 */

import { defineComponent, ref, computed, watch, reactive, h, type PropType } from 'vue';
import type {
  FormSchema,
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';
import { createVueRuntimeAdapter } from '@schepta/adapter-vue';
import { createVueFormAdapter } from '@schepta/adapter-vue';
import { useScheptaContext } from '@schepta/adapter-vue';
import {
  createComponentOrchestrator,
  type FactorySetupResult,
  setFactoryDefaultComponents,
  setFactoryDefaultRenderers,
  getFactoryDefaultComponents,
  getFactoryDefaultRenderers,
  defaultRenderers,
  createTemplateExpressionMiddleware,
  buildInitialValues,
  createSchemaValidator,
  formatValidationErrors,
} from '@schepta/core';
import formSchemaDefinition from '../../src/schemas/form-schema.json';
import { FormRenderer } from './form-renderer';
import { ScheptaFormProvider } from './context/schepta-form-context';
import { defaultComponents } from './defaults/register-default-components';
import { defaultRenderers as vueDefaultRenderers } from './defaults/register-default-renderers';
import { injectScheptaTokens } from './schepta-tokens';

injectScheptaTokens();
setFactoryDefaultComponents(defaultComponents);
setFactoryDefaultRenderers(vueDefaultRenderers);

/**
 * Ref interface for external form control
 */
export interface FormFactoryRef {
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  reset: (values?: Record<string, any>) => void;
  getValues: () => Record<string, any>;
}

export interface FormFactoryProps {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  adapter?: FormAdapter;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

function createDebugContext(enabled: boolean) {
  if (!enabled) return undefined;
  return {
    isEnabled: true,
    log: (category: string, message: string, data?: any) => {
      console.log(`[${category}]`, message, data);
    },
    buffer: { add: () => {}, clear: () => {}, getAll: () => [] },
  };
}

export const FormFactory = defineComponent({
  name: 'FormFactory',
  props: {
    schema: { type: Object as PropType<FormSchema>, required: true },
    components: { type: Object as PropType<Record<string, ComponentSpec>>, default: () => ({}) },
    customComponents: { type: Object as PropType<Record<string, ComponentSpec>>, default: () => ({}) },
    renderers: { type: Object, default: () => ({}) },
    externalContext: { type: Object, default: () => ({}) },
    middlewares: { type: Array as PropType<MiddlewareFn[]>, default: () => [] },
    adapter: { type: Object as PropType<FormAdapter>, default: undefined },
    initialValues: { type: Object, default: undefined },
    onSubmit: { type: Function as PropType<(values: Record<string, any>) => void | Promise<void>>, default: undefined },
    debug: { type: Boolean, default: false },
  },
  setup(props, { expose }) {
    const providerConfig = useScheptaContext();

    const mergedConfig = computed(() => ({
      components: {
        ...getFactoryDefaultComponents(),
        ...(providerConfig?.components || {}),
        ...(props.components || {}),
      },
      customComponents: {
        ...(providerConfig?.customComponents || {}),
        ...(props.customComponents || {}),
      },
      renderers: {
        ...defaultRenderers,
        ...getFactoryDefaultRenderers(),
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
          : (providerConfig?.debug?.enabled || false),
    }));

    const validation = computed(() => {
      try {
        const validator = createSchemaValidator(formSchemaDefinition as object, { throwOnError: false });
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

    const defaultValues = computed(() => {
      const schemaDefaults = buildInitialValues(props.schema);
      return { ...schemaDefaults, ...(props.initialValues || {}) };
    });

    const formAdapter = ref<FormAdapter>(
      props.adapter || createVueFormAdapter(defaultValues.value)
    );

    // Reactive form values - get the reactive object directly from the adapter
    // The adapter exposes its reactive values via the .values property
    const formValues = computed(() => {
      const adapter = formAdapter.value as any;
      return adapter.values || adapter.getState?.() || adapter.getValues();
    });

    const reset = (values?: Record<string, any>) => {
      const resetValues = values || defaultValues.value;
      formAdapter.value.reset(resetValues);
    };

    watch(
      () => [props.initialValues, props.schema] as const,
      () => {
        if (props.initialValues !== undefined) {
          const newDefaults = {
            ...buildInitialValues(props.schema),
            ...props.initialValues,
          };
          reset(newDefaults);
        }
      },
      { deep: true }
    );

    expose({
      submit: (submitFn: (values: Record<string, any>) => void | Promise<void>) =>
        formAdapter.value.handleSubmit(submitFn)(),
      reset,
      getValues: () => formAdapter.value.getValues(),
    } as FormFactoryRef);

    const runtime = ref(createVueRuntimeAdapter());

    const rootComponentKey = computed(
      () => (props.schema as any)['x-component'] || 'FormContainer'
    );

    const renderer = computed(() => {
      const config = mergedConfig.value;
      const debugContext = createDebugContext(config.debug);

      const getFactorySetup = (): FactorySetupResult => {
        const templateMiddleware = createTemplateExpressionMiddleware({
          externalContext: { ...config.externalContext, onSubmit: props.onSubmit },
          formValues: formValues.value,
          debug: debugContext,
        });

        const updatedMiddlewares = [templateMiddleware, ...config.baseMiddlewares];

        const state = formValues.value;
        return {
          components: config.components,
          customComponents: config.customComponents,
          renderers: config.renderers,
          externalContext: { ...config.externalContext, onSubmit: props.onSubmit },
          state,
          middlewares: updatedMiddlewares,
          onSubmit: props.onSubmit,
          debug: debugContext,
          formAdapter: formAdapter.value,
        };
      };

      return createComponentOrchestrator(getFactorySetup, runtime.value);
    });

    return () => {
      if (!validation.value.valid) {
        return h('div', {
          style: {
            padding: '16px',
            backgroundColor: 'var(--schepta-error-bg)',
            border: '1px solid var(--schepta-error-border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
          },
        }, [
          h('h3', { style: { color: 'var(--schepta-error-text)', margin: '0 0 12px 0' } }, 'Schema Validation Error'),
          h('pre', {
            style: {
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              margin: 0,
              color: 'var(--schepta-error-text-muted)',
            },
          }, validation.value.formattedErrors),
        ]);
      }

      return h(ScheptaFormProvider, {
            adapter: formAdapter.value,
            values: formValues.value as Record<string, any>,
      }, {
        default: () =>
          h(FormRenderer, {
            componentKey: rootComponentKey.value,
            schema: props.schema,
            renderer: renderer.value,
          }),
      });
    };
  },
});
