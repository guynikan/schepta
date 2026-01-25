/**
 * React Form Factory
 * 
 * Factory component for rendering forms from JSON schemas
 */

import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { FormProvider, UseFormReturn, useFormContext } from 'react-hook-form';
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

/**
 * Props passed to the SubmitButton component by FormFactory.
 * Use this type when customizing SubmitButton via components.SubmitButton to ensure
 * correct typing and that onSubmit is always handled.
 *
 * @example
 * ```tsx
 * import { SubmitButtonProps } from '@schepta/factory-react';
 * import { useFormContext } from 'react-hook-form';
 *
 * const MySubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, children }) => {
 *   const { handleSubmit } = useFormContext();
 *   return (
 *     <button type="button" onClick={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
 *       {children ?? 'Submit'}
 *     </button>
 *   );
 * };
 * ```
 */
export interface SubmitButtonProps {
  /**
   * Submit handler - called with form values.
   * FormFactory always passes this when rendering the built-in SubmitButton.
   * When used from schema, it may also be provided via externalContext.onSubmit.
   */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Optional label (e.g. from x-content when used from schema) */
  'x-content'?: string;
  /** Optional external context (when used from schema). May contain onSubmit. */
  externalContext?: Record<string, any>;
  /** Optional children */
  children?: React.ReactNode;
}

/**
 * Component type for custom SubmitButton. Use with createComponentSpec when
 * registering a custom SubmitButton in components.
 */
export type SubmitButtonComponentType = React.ComponentType<SubmitButtonProps>;

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
  formContext?: UseFormReturn<any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
}

/**
 * Default submit button component
 * Can be overridden via components prop or ScheptaProvider
 */
const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit }) => {
  const formContext = useFormContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmit) formContext.handleSubmit(onSubmit)();
  };

  return (
    <div style={{ marginTop: '24px', textAlign: 'right' }}>
      <button
        type="button"
        onClick={handleClick}
        data-test-id="submit-button"
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        Submit
      </button>
    </div>
  );
};

export const FormFactory = forwardRef<FormFactoryRef, FormFactoryProps>(function FormFactory({
  schema,
  components,
  renderers,
  externalContext,
  middlewares,
  formContext: providedFormContext,
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

  // Setup react-hook-form
  const { formContext, formAdapter, formState } = useScheptaForm(schema, {
    formContext: providedFormContext,
    initialValues,
  });

  // Expose form control methods via ref for external submit scenarios
  useImperativeHandle(ref, () => ({
    submit: (submitFn) => formContext.handleSubmit(submitFn)(),
    reset: (values) => formContext.reset(values),
    getValues: () => formContext.getValues(),
  }), [formContext]);

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
      {onSubmit && <SubmitButtonComponent onSubmit={onSubmit} />}
    </FormProvider>
  );
});
