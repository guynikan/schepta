/**
 * Vue Form Factory
 *
 * Renders forms from JSON schemas. The public API (`FormFactoryProps`,
 * `FormFactoryRef`) is preserved for backwards compatibility. Internally the
 * factory is composed on top of the generic `createVueFactory` primitive.
 */

import { ref, computed, watch, h, type PropType, type VNode } from 'vue';
import type {
  FormSchema,
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';
import { buildInitialValues } from '@schepta/core';
import { createVueFormAdapter } from '@schepta/adapter-vue';
import formSchemaDefinition from '@schepta/factories/schemas/form-schema.json';
import { ScheptaFormProvider } from './context/schepta-form-context';
import { defaultComponents } from './defaults/register-default-components';
import { defaultRenderers as vueDefaultRenderers } from './defaults/register-default-renderers';
import { injectScheptaTokens } from './schepta-tokens';
import {
  createVueFactory,
  type VueFactoryBaseProps,
  type VueFactorySetupHook,
} from './create-factory';

injectScheptaTokens();

export interface FormFactoryRef {
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  reset: (values?: Record<string, any>) => void;
  getValues: () => Record<string, any>;
}

export interface FormFactoryProps extends VueFactoryBaseProps {
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

const useFormSetup: VueFactorySetupHook<FormFactoryProps, FormFactoryRef> = ({ props }) => {
  const defaultValues = computed(() => {
    const schemaDefaults = buildInitialValues(props.schema);
    return { ...schemaDefaults, ...(props.initialValues || {}) };
  });

  const formAdapter = ref<FormAdapter>(
    props.adapter || createVueFormAdapter(defaultValues.value)
  );

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

  const refApi: FormFactoryRef = {
    submit: (submitFn) => formAdapter.value.handleSubmit(submitFn)(),
    reset,
    getValues: () => formAdapter.value.getValues(),
  };

  return {
    getState: () => formValues.value as Record<string, any>,
    getFormAdapter: () => formAdapter.value,
    getOnSubmit: () => props.onSubmit,
    getExternalContext: () =>
      props.onSubmit ? { onSubmit: props.onSubmit } : undefined,
    refApi,
    wrap: (children: VNode | VNode[]) =>
      h(
        ScheptaFormProvider as any,
        {
          adapter: formAdapter.value,
          values: formValues.value as Record<string, any>,
        },
        {
          default: () => children,
        }
      ),
  };
};

export const FormFactory = createVueFactory<FormFactoryProps, FormFactoryRef>({
  name: 'FormFactory',
  schemaDefinition: formSchemaDefinition as object,
  rootComponentKey: 'FormContainer',
  defaultComponents,
  defaultRenderers: vueDefaultRenderers,
  propsDef: {
    schema: { type: Object as PropType<FormSchema>, required: true },
    components: { type: Object as PropType<Record<string, ComponentSpec>>, default: () => ({}) },
    customComponents: { type: Object as PropType<Record<string, ComponentSpec>>, default: () => ({}) },
    renderers: { type: Object, default: () => ({}) },
    externalContext: { type: Object, default: () => ({}) },
    middlewares: { type: Array as PropType<MiddlewareFn[]>, default: () => [] },
    adapter: { type: Object as PropType<FormAdapter>, default: undefined },
    initialValues: { type: Object, default: undefined },
    onSubmit: {
      type: Function as PropType<(values: Record<string, any>) => void | Promise<void>>,
      default: undefined,
    },
    debug: { type: Boolean, default: false },
  },
  useSetup: useFormSetup,
});
