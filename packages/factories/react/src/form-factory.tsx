/**
 * React Form Factory
 * 
 * Factory component for rendering forms from JSON schemas.
 */

import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import type { FormSchema, ComponentSpec, MiddlewareFn, FormAdapter } from '@schepta/core';
import { createReactRuntimeAdapter } from '@schepta/adapter-react';
import { 
  createRendererOrchestrator, 
  type FactorySetupResult,
  setFactoryDefaultComponents,
  createComponentSpec,
} from '@schepta/core';
import { createTemplateExpressionMiddleware } from '@schepta/core';
import { FormRenderer } from './form-renderer';
import { useMergedScheptaConfig } from './hooks/use-merged-config';
import { useScheptaForm } from './hooks/use-schepta-form';
import { useSchemaValidation } from './hooks/use-schema-validation';
import { createDebugContext } from './utils/debug';
import { createFieldRenderer } from './renderers/field-renderer';
import formSchemaDefinition from '../../src/schemas/form-schema.json';
import { ScheptaFormProvider } from './context/schepta-form-context';
import { 
  DefaultFormContainer, 
  DefaultSubmitButton, 
  DefaultFieldWrapper,
  type SubmitButtonComponentType,
  type FieldWrapperType,
} from './components';

// Register factory default components (called once on module load)
setFactoryDefaultComponents({
  FormContainer: createComponentSpec({
    id: 'FormContainer',
    type: 'FormContainer',
    factory: () => DefaultFormContainer,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: () => DefaultSubmitButton,
  }),
  FieldWrapper: createComponentSpec({
    id: 'FieldWrapper',
    type: 'field-wrapper',
    factory: () => DefaultFieldWrapper,
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

export interface FormFactoryProps {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  adapter?: FormAdapter;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

export const FormFactory = forwardRef<FormFactoryRef, FormFactoryProps>(function FormFactory({
  schema,
  components,
  renderers,
  externalContext,
  middlewares,
  adapter: providedAdapter,
  initialValues,
  onSubmit,
  debug = false,
}: FormFactoryProps, ref) {
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

  const { formAdapter, formValues, reset } = useScheptaForm(schema, {
    initialValues,
    adapter: providedAdapter,
  });

  // Expose form control methods via ref for external submit scenarios
  useImperativeHandle(ref, () => ({
    submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
    reset: (values) => reset(values),
    getValues: () => formAdapter.getValues(),
  }), [formAdapter, reset]);

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
  const rootComponentKey = (schema as any)['x-component'] || 'FormContainer';

  // Resolve SubmitButton component from registry (provider or local) or use default
  const SubmitButtonComponent = useMemo((): SubmitButtonComponentType => {
    const customComponent = mergedConfig.components.SubmitButton?.factory?.({}, runtime);
    return (customComponent as SubmitButtonComponentType) || DefaultSubmitButton;
  }, [mergedConfig.components.SubmitButton, runtime]);

  // Resolve FieldWrapper component from registry (provider or local) or use default
  const FieldWrapperComponent = useMemo((): FieldWrapperType => {
    const customComponent = mergedConfig.components.FieldWrapper?.factory?.({}, runtime);
    return (customComponent as FieldWrapperType) || DefaultFieldWrapper;
  }, [mergedConfig.components.FieldWrapper, runtime]);

  // Create renderer orchestrator
  const renderer = useMemo(() => {
    const getFactorySetup = (): FactorySetupResult => {
      // Create debug context
      const debugContext = createDebugContext(mergedConfig.debug);

      // Create custom renderers with field renderer (passing resolved FieldWrapper)
      const customRenderers = {
        ...mergedConfig.renderers,
        field: createFieldRenderer({ FieldWrapper: FieldWrapperComponent }),
      };

      // Create template expression middleware with current form values (always first)
      const templateMiddleware = createTemplateExpressionMiddleware({
        externalContext: mergedConfig.externalContext,
        formValues,
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
        externalContext: {
          ...mergedConfig.externalContext,
        },
        state: formValues,
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
    formAdapter,
    runtime,
    onSubmit,
    formValues,
    SubmitButtonComponent,
    FieldWrapperComponent,
  ]);

  return (
    <ScheptaFormProvider initialValues={initialValues} adapter={formAdapter} values={formValues}>
      <FormRenderer
        componentKey={rootComponentKey}
        schema={schema}
        renderer={renderer}
      />
    </ScheptaFormProvider>
  );
});
