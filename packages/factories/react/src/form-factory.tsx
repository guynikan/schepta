/**
 * React Form Factory
 * 
 * Factory component for rendering forms from JSON schemas
 */

import React, { useMemo } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import type { FormSchema, ComponentSpec, MiddlewareFn } from '@schepta/core';
import { createReactRuntimeAdapter } from '@schepta/adapter-react';
import { createRendererOrchestrator, type FactorySetupResult } from '@schepta/core';
import { createTemplateExpressionMiddleware } from '@schepta/core';
import { FormRenderer } from './form-renderer';
import { useMergedScheptaConfig } from './hooks/use-merged-config';
import { useScheptaForm } from './hooks/use-schepta-form';
import { useSchemaValidation } from './hooks/use-schema-validation';
import { createDebugContext } from './utils/debug';
import { createFieldRenderer } from './renderers/field-renderer';
import formSchemaDefinition from '../../src/schemas/form-schema.json';

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
  // Validate schema instance before rendering
  const validation = useSchemaValidation(schema, {
    formSchema: formSchemaDefinition,
  });

  // Merge provider config with local props
  const mergedConfig = useMergedScheptaConfig({
    components,
    renderers,
    externalContext,
    middlewares,
    debug,
  });

  // Setup react-hook-form
  const { formContext, formAdapter, formState } = useScheptaForm(schema, {
    formContext: providedFormContext,
    initialValues,
  });

  // Create runtime adapter
  const runtime = useMemo(() => createReactRuntimeAdapter(), []);

  // If schema validation failed, render error UI
  if (!validation.valid) {
    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fff0f0', 
        border: '1px solid #ffcccc',
        borderRadius: '4px',
        fontFamily: 'monospace',
      }}>
        <h3 style={{ color: '#cc0000', margin: '0 0 12px 0' }}>
          Schema Validation Error
        </h3>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          fontSize: '12px',
          margin: 0,
          color: '#660000',
        }}>
          {validation.formattedErrors}
        </pre>
      </div>
    );
  }

  // Get root component key from schema
  const rootComponentKey = (schema as any)['x-component'] || 'form-container';

  // Create renderer orchestrator
  const renderer = useMemo(() => {
    const getFactorySetup = (): FactorySetupResult => {
      // Get current form state
      const currentFormState = formContext.watch();

      // Create debug context
      const debugContext = createDebugContext(mergedConfig.debug);

      // Create custom renderers with field renderer
      const customRenderers = {
        ...mergedConfig.renderers,
        field: createFieldRenderer(),
      };

      // Create template expression middleware with current form state (always first)
      const templateMiddleware = createTemplateExpressionMiddleware({
        externalContext: mergedConfig.externalContext,
        formState: currentFormState,
        debug: debugContext,
      });

      // Build middlewares: template middleware first, then provider, then local
      const updatedMiddlewares = [
        templateMiddleware,
        ...mergedConfig.baseMiddlewares,
      ];

      return {
        components: mergedConfig.components,
        renderers: customRenderers,
        externalContext: mergedConfig.externalContext,
        state: currentFormState,
        middlewares: updatedMiddlewares,
        onSubmit,
        debug: debugContext,
        formAdapter,
      };
    };

    return createRendererOrchestrator(getFactorySetup, runtime);
  }, [
    mergedConfig.components,
    mergedConfig.renderers,
    mergedConfig.externalContext,
    mergedConfig.baseMiddlewares,
    mergedConfig.debug,
    formContext,
    formAdapter,
    runtime,
    onSubmit,
    formState, // Include formState to trigger re-renders on form changes
  ]);

  return (
    <FormProvider {...formContext}>
      <FormRenderer
        componentKey={rootComponentKey}
        schema={schema}
        renderer={renderer}
      />
    </FormProvider>
  );
}
