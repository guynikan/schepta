/**
 * React Form Factory
 *
 * Factory component for rendering forms from JSON schemas.
 */

import { useMemo, forwardRef, useImperativeHandle } from "react";
import type {
  FormSchema,
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from "@schepta/core";
import { createReactRuntimeAdapter } from "@schepta/adapter-react";
import {
  createComponentOrchestrator,
  type FactorySetupResult,
  setFactoryDefaultComponents,
  setFactoryDefaultRenderers,
} from "@schepta/core";
import { createTemplateExpressionMiddleware } from "@schepta/core";
import { FormRenderer } from "./form-renderer";
import { useMergedScheptaConfig } from "./hooks/use-merged-config";
import { useScheptaForm } from "./hooks/use-schepta-form";
import { useSchemaValidation } from "./hooks/use-schema-validation";
import { createDebugContext } from "./utils/debug";
import formSchemaDefinition from "../../src/schemas/form-schema.json";
import { ScheptaFormProvider } from "./context/schepta-form-context";
import { defaultComponents } from "./defaults/register-default-components";
import { defaultRenderers } from "./defaults/register-default-renderers";

// Register factory default components (called once on module load)
setFactoryDefaultComponents(defaultComponents);
setFactoryDefaultRenderers(defaultRenderers);

/**
 * Ref interface for external form control
 */
export interface FormFactoryRef {
  /** Submit the form with the provided handler */
  submit: (
    onSubmit: (values: Record<string, any>) => void | Promise<void>
  ) => void;
  /** Reset form to initial or provided values */
  reset: (values?: Record<string, any>) => void;
  /** Get current form values */
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

export const FormFactory = forwardRef<FormFactoryRef, FormFactoryProps>(
  function FormFactory(
    {
      schema,
      components,
      customComponents,
      renderers,
      externalContext,
      middlewares,
      adapter: providedAdapter,
      initialValues,
      onSubmit,
      debug = false,
    }: FormFactoryProps,
    ref
  ) {
    // Validate schema instance before rendering
    const validation = useSchemaValidation(schema, {
      formSchema: formSchemaDefinition,
    });

    // Merge provider config with local props
    const mergedConfig = useMergedScheptaConfig({
      components,
      customComponents,
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
    useImperativeHandle(
      ref,
      () => ({
        submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
        reset: (values) => reset(values),
        getValues: () => formAdapter.getValues(),
      }),
      [formAdapter, reset]
    );

    // Create runtime adapter
    const runtime = useMemo(() => createReactRuntimeAdapter(), []);

    // If schema validation failed, render error UI
    if (!validation.valid) {
      return (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fff0f0",
            border: "1px solid #ffcccc",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ color: "#cc0000", margin: "0 0 12px 0" }}>
            Schema Validation Error
          </h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              margin: 0,
              color: "#660000",
            }}
          >
            {validation.formattedErrors}
          </pre>
        </div>
      );
    }

    // Get root component key from schema
    const rootComponentKey = (schema as any)["x-component"] || "FormContainer";

    // Create renderer orchestrator
    const renderer = useMemo(() => {
      const getFactorySetup = (): FactorySetupResult => {
        // Create debug context
        const debugContext = createDebugContext(mergedConfig.debug);

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
          customComponents: mergedConfig.customComponents,
          renderers: mergedConfig.renderers,
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

      return createComponentOrchestrator(getFactorySetup, runtime);
    }, [
      mergedConfig.components,
      mergedConfig.customComponents,
      mergedConfig.renderers,
      mergedConfig.externalContext,
      mergedConfig.baseMiddlewares,
      mergedConfig.debug,
      formAdapter,
      runtime,
      onSubmit,
      formValues,
    ]);

    return (
      <ScheptaFormProvider
        initialValues={initialValues}
        adapter={formAdapter}
        values={formValues}
      >
        <FormRenderer
          componentKey={rootComponentKey}
          schema={schema}
          renderer={renderer}
        />
      </ScheptaFormProvider>
    );
  }
);
