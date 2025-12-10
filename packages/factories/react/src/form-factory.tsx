/**
 * React Form Factory
 * 
 * Factory component for rendering forms from JSON schemas
 */

import React, { useEffect, useMemo } from 'react';
import { FormProvider, useForm, UseFormReturn, useWatch } from 'react-hook-form';
import type { FormSchema, ComponentSpec, RendererFn, RuntimeAdapter, MiddlewareFn } from '@schepta/core';
import { createReactRuntimeAdapter } from '@schepta/adapter-react';
import { createReactHookFormAdapter } from '@schepta/adapter-react';
import { useScheptaContext } from '@schepta/adapter-react';
import { createRendererOrchestrator, type FactorySetupResult } from '@schepta/core';
import { buildInitialValuesFromSchema } from '@schepta/core';
import { createTemplateExpressionMiddleware } from '@schepta/core';
import { FormRenderer } from './form-renderer';
import { FieldWrapper } from './field-wrapper';

// Custom field renderer that wraps fields with FieldWrapper
const createFieldRenderer = (): RendererFn => {
  return (spec: ComponentSpec, props: Record<string, any>, runtime: RuntimeAdapter, children?: any[]) => {
    // Extract name from props
    const name = props.name || '';
    
    // If this is a field component and we have a name, wrap it with FieldWrapper
    if (name && spec.type === 'field') {
      const Component = spec.factory(props, runtime);
      
      // Extract component props - x-ui is already spread in props by orchestrator
      // Also get x-component-props if present
      const xUI = props['x-ui'] || {}; // Fallback if not spread
      const xComponentProps = props['x-component-props'] || {};
      
      // Build componentProps: x-ui props (label, placeholder, etc.) are already in props
      // but we need to extract them explicitly and merge with x-component-props
      const componentProps = {
        ...xComponentProps,
        // Extract x-ui props that are already spread in props
        label: props.label,
        placeholder: props.placeholder,
        order: props.order,
        // Also include any other props that might be from x-ui
        ...xUI, // Fallback if x-ui wasn't spread
        name, // Ensure name is passed
      };
      
      // Create FieldWrapper using React.createElement directly since we're in React context
      return React.createElement(FieldWrapper, {
        name,
        component: Component as any,
        componentProps,
        children,
      });
    }
    
    // For non-field components or fields without name, use default rendering
    const xComponentProps = props['x-component-props'] || {};
    const propsWithChildren = children && children.length > 0 
      ? { ...props, ...xComponentProps, children }
      : { ...props, ...xComponentProps };
    
    // Clean up metadata props
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
  middlewares?: MiddlewareFn[];
  formContext?: UseFormReturn<any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

export function FormFactory({
  schema,
  components,
  renderers,
  externalContext,
  middlewares,
  formContext: providedFormContext,
  initialValues,
  onSubmit,
  debug = false,
}: FormFactoryProps) {
  // Get provider config (optional - returns null if no provider)
  const providerConfig = useScheptaContext();
  
  // Merge: provider config as base, local props override
  const mergedComponents = {
    ...(providerConfig?.components || {}),
    ...(components || {}),
  };
  const mergedRenderers = {
    ...(providerConfig?.renderers || {}),
    ...(renderers || {}),
  };
  const mergedExternalContext = {
    ...(providerConfig?.externalContext || {}),
    ...(externalContext || {}),
  };
  const mergedDebug = debug !== false ? debug : (providerConfig?.debug?.enabled || false);
  
  // Template middleware will be created dynamically in getFactorySetup
  // with current formState, so we just prepare the base middlewares here
  const baseMiddlewares = [
    ...(providerConfig?.middlewares || []),
    ...(middlewares || []),
  ];
  
  const defaultFormContext = useForm({
    defaultValues: initialValues || buildInitialValuesFromSchema(schema),
  });
  
  const formContext = providedFormContext || defaultFormContext;
  const formAdapter = useMemo(
    () => createReactHookFormAdapter(formContext),
    [formContext]
  );
  
  const runtime = useMemo(() => createReactRuntimeAdapter(), []);

  useEffect(() => {
    if (initialValues !== undefined) {
      const defaultValues = {
        ...buildInitialValuesFromSchema(schema),
        ...initialValues,
      };
      formContext.reset(defaultValues);
    }
  }, [formContext, initialValues, schema]);

  const rootComponentKey = (schema as any)['x-component'] || 'form-container';

  // Watch form state to trigger re-renders when values change
  // This ensures template expressions with $formValues are updated
  // useWatch without arguments watches all fields and triggers re-render on any change
  const formState = useWatch({
    control: formContext.control,
  });

  const renderer = useMemo(() => {
    const getFactorySetup = (): FactorySetupResult => {
      // Get current form state (useWatch already provides it, but get fresh copy)
      const currentFormState = formContext.watch();
      
      // Create custom renderers with field renderer
      const customRenderers = {
        ...mergedRenderers,
        field: createFieldRenderer(),
      };
      
      // Create template expression middleware with current form state (always first)
      const templateMiddleware = createTemplateExpressionMiddleware({
        externalContext: mergedExternalContext,
        formState: currentFormState,
        debug: mergedDebug ? {
          isEnabled: true,
          log: (category, message, data) => {
            console.log(`[${category}]`, message, data);
          },
          buffer: {
            add: (entry) => {},
            clear: () => {},
            getAll: () => [],
          },
        } : undefined,
      });
      
      // Build middlewares: template middleware first, then provider, then local
      const updatedMiddlewares = [
        templateMiddleware,
        ...baseMiddlewares,
      ];
      
      return {
        components: mergedComponents,
        renderers: customRenderers,
        externalContext: mergedExternalContext,
        state: currentFormState,
        middlewares: updatedMiddlewares,
        onSubmit,
        debug: mergedDebug ? {
          isEnabled: true,
          log: (category, message, data) => {
            console.log(`[${category}]`, message, data);
          },
          buffer: {
            add: (entry) => {},
            clear: () => {},
            getAll: () => [],
          },
        } : undefined,
        formAdapter,
      };
    };
    
    return createRendererOrchestrator(getFactorySetup, runtime);
  }, [mergedComponents, mergedRenderers, mergedExternalContext, formContext, mergedDebug, formAdapter, runtime, onSubmit, baseMiddlewares, formState]);

  // Handle submit button click
  const handleSubmitClick = () => {
    if (onSubmit) {
      formContext.handleSubmit(onSubmit)();
    }
  };

  const content = (
    <FormRenderer
      componentKey={rootComponentKey}
      schema={schema}
      renderer={renderer}
    />
  );

  return (
    <FormProvider {...formContext}>
      {content}
    </FormProvider>
  );
}

