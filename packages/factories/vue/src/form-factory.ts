/**
 * Vue Form Factory
 */

import { defineComponent, ref, computed, watch } from 'vue';
import type { FormSchema, ComponentSpec } from '@spectra/core';
import { createVueRuntimeAdapter } from '@spectra/adapter-vue';
import { createVueFormAdapter } from '@spectra/adapter-vue';
import { createRendererOrchestrator, type FactorySetupResult } from '@spectra/core';
import { buildInitialValuesFromSchema } from '@spectra/core';
import { FormRenderer } from './form-renderer';

export interface FormFactoryProps {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

export function createFormFactory(props: FormFactoryProps) {
  return defineComponent({
    name: 'FormFactory',
    setup() {
      const formAdapter = ref(createVueFormAdapter(
        props.initialValues || buildInitialValuesFromSchema(props.schema)
      ));
      const runtime = ref(createVueRuntimeAdapter());

      const getFactorySetup = (): FactorySetupResult => {
        return {
          components: props.components || {},
          renderers: props.renderers,
          externalContext: props.externalContext || {},
          state: formAdapter.value.getValues(),
          middlewares: [],
          debug: props.debug ? {
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
          formAdapter: formAdapter.value,
        };
      };

      const renderer = computed(() => 
        createRendererOrchestrator(getFactorySetup, runtime.value)
      );

      const rootComponentKey = (props.schema as any)['x-component'] || 'form-container';

      return () => {
        return {
          component: FormRenderer,
          props: {
            componentKey: rootComponentKey,
            schema: props.schema,
            renderer: renderer.value,
            onSubmit: props.onSubmit ? () => formAdapter.value.handleSubmit(props.onSubmit!)() : undefined,
          },
        };
      };
    },
  });
}

