/**
 * Vue Form Factory
 */

import { defineComponent, ref, computed, watch, h, type PropType } from 'vue';
import type { FormSchema, ComponentSpec, RendererFn, RuntimeAdapter } from '@schepta/core';
import { createVueRuntimeAdapter } from '@schepta/adapter-vue';
import { createVueFormAdapter } from '@schepta/adapter-vue';
import { useScheptaContext } from '@schepta/adapter-vue';
import { 
  createRendererOrchestrator, 
  type FactorySetupResult,
  setFactoryDefaultComponents,
  createComponentSpec,
} from '@schepta/core';
import { buildInitialValues } from '@schepta/core';
import { FormRenderer } from './form-renderer';
import { DefaultFormContainer, DefaultSubmitButton } from './components';

// Register factory default components (called once on module load)
setFactoryDefaultComponents({
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'container',
    factory: () => DefaultFormContainer,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: () => DefaultSubmitButton,
  }),
});

/**
 * Ref interface for external form control
 */
export interface FormFactoryRef {
  /** Submit the form with the provided handler */
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  /** Reset form to initial or provided values */
  reset: (values?: Record<string, any>) => void;
  /** Get current form values */
  getValues: () => Record<string, any>;
}

// Custom field renderer that integrates fields with VueFormAdapter
const createFieldRenderer = (formAdapter: any): RendererFn => {
  return (spec: ComponentSpec, props: Record<string, any>, runtime: RuntimeAdapter, children?: any[]) => {
    const name = props.name || '';
    
    // If this is a field component and we have a name, bind it to form adapter
    if (name && spec.type === 'field') {
      // Extract component props - x-ui contains label, placeholder, etc.
      // Note: x-ui props are already spread into props by the orchestrator
      // So we can access label, placeholder directly from props
      const xUI = props['x-ui'] || {};
      const xComponentProps = props['x-component-props'] || {};
      
      // Build component props - spread x-ui props directly (they're already in props from orchestrator)
      // But also check x-ui object in case it wasn't spread
      const componentProps = {
        ...xComponentProps,
        // Get label/placeholder from props directly (orchestrator spreads x-ui) or from x-ui object
        label: props.label || xUI.label,
        placeholder: props.placeholder || xUI.placeholder,
        ...xUI, // Spread any other x-ui props
        name,
        value: formAdapter.getValue(name),
        modelValue: formAdapter.getValue(name),
        onChange: (value: any) => {
          formAdapter.setValue(name, value);
        },
        'onUpdate:modelValue': (value: any) => {
          formAdapter.setValue(name, value);
        },
      };
      
      // Clean up metadata props that shouldn't be passed to the component
      delete componentProps['x-component-props'];
      delete componentProps['x-ui'];
      
      return runtime.create(spec, componentProps);
    }
    
    // For non-field components, use default rendering
    const xComponentProps = props['x-component-props'] || {};
    const propsWithChildren = children && children.length > 0 
      ? { ...props, ...xComponentProps, children }
      : { ...props, ...xComponentProps };
    
    delete propsWithChildren['x-component-props'];
    delete propsWithChildren['x-ui'];
    
    return runtime.create(spec, propsWithChildren);
  };
};

export interface FormFactoryProps {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

export function createFormFactory(defaultProps: FormFactoryProps) {
  return defineComponent({
    name: 'FormFactory',
    props: {
      schema: {
        type: Object as () => FormSchema,
        required: false,
        default: () => defaultProps.schema,
      },
      components: {
        type: Object,
        required: false,
        default: () => defaultProps.components || {},
      },
      renderers: {
        type: Object,
        required: false,
        default: () => defaultProps.renderers || {},
      },
      externalContext: {
        type: Object,
        required: false,
        default: () => defaultProps.externalContext || {},
      },
      initialValues: {
        type: Object,
        required: false,
        default: () => defaultProps.initialValues,
      },
      onSubmit: {
        type: [Function, undefined] as any,
        required: false,
        default: () => defaultProps.onSubmit,
      },
      debug: {
        type: Boolean,
        required: false,
        default: () => defaultProps.debug || false,
      },
    },
    setup(props, { expose }) {
      // Get provider config (optional - returns null if no provider)
      const providerConfig = useScheptaContext();
      
      // Use props if provided, otherwise fall back to defaultProps
      const schema = props.schema || defaultProps.schema;
      
      // Merge: local props > provider config > defaults
      const mergedComponents = props.components || defaultProps.components || providerConfig?.components || {};
      const mergedRenderers = props.renderers || defaultProps.renderers || providerConfig?.renderers || {};
      const mergedMiddlewares = providerConfig?.middlewares || [];
      const mergedExternalContext = {
        ...(providerConfig?.externalContext || {}),
        ...(props.externalContext || defaultProps.externalContext || {}),
      };
      const mergedDebug = props.debug !== undefined 
        ? props.debug 
        : (defaultProps.debug !== undefined ? defaultProps.debug : (providerConfig?.debug?.enabled || false));
      
      
      const formAdapter = ref(createVueFormAdapter(
        props.initialValues || buildInitialValues(props.schema)
      ));
      const runtime = ref(createVueRuntimeAdapter());

      // Expose form control methods via ref for external submit scenarios
      expose({
        submit: (submitFn: (values: Record<string, any>) => void | Promise<void>) => 
          formAdapter.value.handleSubmit(submitFn)(),
        reset: (values?: Record<string, any>) => formAdapter.value.reset(values),
        getValues: () => formAdapter.value.getValues(),
      } as FormFactoryRef);

      const getFactorySetup = (): FactorySetupResult => {
        // Create custom renderers with field renderer
        const customRenderers = {
          ...mergedRenderers,
          field: createFieldRenderer(formAdapter.value),
        };
        
        return {
          components: mergedComponents,
          renderers: customRenderers,
          externalContext: {
            ...mergedExternalContext,
            onSubmit: props.onSubmit,
          },
          state: formAdapter.value.getValues(),
          middlewares: mergedMiddlewares,
          onSubmit: props.onSubmit ? () => formAdapter.value.handleSubmit(props.onSubmit!)() : undefined,
          debug: mergedDebug ? {
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

      const rootComponentKey = computed(() => (props.schema as any)['x-component'] || 'FormContainer');

      // Watch form state to trigger reactivity
      watch(() => formAdapter.value.getValues(), () => {
        // Force re-render when form values change
      }, { deep: true });

      // Watch for schema changes
      watch(() => props.schema, (newSchema) => {
        if (props.initialValues) {
          formAdapter.value.reset(props.initialValues);
        } else if (newSchema) {
          formAdapter.value.reset(buildInitialValues(newSchema as FormSchema));
        }
      }, { deep: true });

      return () => {
        return h(FormRenderer, {
          componentKey: rootComponentKey.value,
          schema: props.schema,
          renderer: renderer.value,
        });
      };
    },
  });
}

