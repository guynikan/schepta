/**
 * React Form Factory
 * 
 * Factory component for rendering forms from JSON schemas
 */

import React, { useEffect, useMemo } from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import type { FormSchema, ComponentSpec, RendererFn, RuntimeAdapter } from '@schepta/core';
import { createReactRuntimeAdapter } from '@schepta/adapter-react';
import { createReactHookFormAdapter } from '@schepta/adapter-react';
import { createRendererOrchestrator, type FactorySetupResult } from '@schepta/core';
import { buildInitialValuesFromSchema } from '@schepta/core';
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
  formContext?: UseFormReturn<any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

export function FormFactory({
  schema,
  components = {},
  renderers = {},
  externalContext = {},
  formContext: providedFormContext,
  initialValues,
  onSubmit,
  debug = false,
}: FormFactoryProps) {
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

  const renderer = useMemo(() => {
    const getFactorySetup = (): FactorySetupResult => {
      const formState = formContext.watch();
      
      // Create custom renderers with field renderer
      const customRenderers = {
        ...renderers,
        field: createFieldRenderer(),
      };
      
      // Pass onSubmit through externalContext so components can access it
      const contextWithSubmit = {
        ...externalContext,
        onSubmit,
      };
      
      return {
        components,
        renderers: customRenderers,
        externalContext: contextWithSubmit,
        state: formState,
        middlewares: [], // Middlewares will be added via registry
        debug: debug ? {
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
  }, [components, renderers, externalContext, formContext, debug, formAdapter, runtime, onSubmit]);

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

