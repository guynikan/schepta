/**
 * React Form Factory
 *
 * Factory component for rendering forms from JSON schemas.
 */

import { useMemo, useRef, useSyncExternalStore, useCallback, forwardRef, useImperativeHandle } from "react";
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
  hasFormValueTemplates,
} from "@schepta/core";
import { NativeReactFormAdapter } from "@schepta/adapter-react";
import { createTemplateExpressionMiddleware } from "@schepta/core";
import { FormRenderer } from "./form-renderer";
import { useMergedScheptaConfig } from "./hooks/use-merged-config";
import { useScheptaForm } from "./hooks/use-schepta-form";
import { useSchemaValidation } from "./hooks/use-schema-validation";
import { createDebugContext } from "./utils/debug";
import formSchemaDefinition from "@schepta/factories/schemas/form-schema.json";
import { ScheptaFormProvider } from "./context/schepta-form-context";
import { defaultComponents } from "./defaults/register-default-components";
import { defaultRenderers } from "./defaults/register-default-renderers";
import { injectScheptaTokens } from "./schepta-tokens";

injectScheptaTokens();
setFactoryDefaultComponents(defaultComponents);
setFactoryDefaultRenderers(defaultRenderers);

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
    const validation = useSchemaValidation(schema, {
      formSchema: formSchemaDefinition,
    });

    const mergedConfig = useMergedScheptaConfig({
      components,
      customComponents,
      renderers,
      externalContext,
      middlewares,
      debug,
    });

    const { formAdapter, reset } = useScheptaForm(schema, {
      initialValues,
      adapter: providedAdapter,
    });

    useImperativeHandle(
      ref,
      () => ({
        submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
        reset: (values) => reset(values),
        getValues: () => formAdapter.getValues(),
      }),
      [formAdapter, reset]
    );

    const runtime = useMemo(() => createReactRuntimeAdapter(), []);

    // Determine once (per schema change) whether template resolution needs
    // form values at all. If not, FormFactory never re-renders on user input.
    const needsFormValueRerender = useMemo(
      () => hasFormValueTemplates(schema),
      [schema]
    );

    // Stable ref for onSubmit so the orchestrator closure never goes stale
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    // Subscribe to adapter value changes ONLY when the schema has {{ $formValues.* }}
    // templates. This is the sole trigger that causes FormFactory to re-render
    // (for cross-field template resolution). For plain forms, this is a no-op.
    const subscribeToAdapter = useCallback(
      (onStoreChange: () => void) => {
        if (needsFormValueRerender && formAdapter instanceof NativeReactFormAdapter) {
          return formAdapter.subscribeAll(onStoreChange);
        }
        return () => {};
      },
      [needsFormValueRerender, formAdapter]
    );
    const getAdapterSnapshot = useCallback(
      () => {
        if (formAdapter instanceof NativeReactFormAdapter) {
          return formAdapter.getValuesSnapshot();
        }
        return formAdapter.getValues();
      },
      [formAdapter]
    );
    // formValues is only used by the orchestrator below; it only changes when
    // needsFormValueRerender is true (otherwise subscribeToAdapter is a no-op
    // and this snapshot never triggers a re-render).
    const formValues = useSyncExternalStore(
      subscribeToAdapter,
      getAdapterSnapshot,
      getAdapterSnapshot
    );

    // Keep a mutable ref so the orchestrator closure always reads the freshest
    // values without needing to be recreated on every render
    const formValuesRef = useRef(formValues);
    formValuesRef.current = formValues;

    // Stable orchestrator — recreated only when config/adapter/runtime changes,
    // NOT when form values change (that's handled via formValuesRef above).
    const renderer = useMemo(() => {
      const getFactorySetup = (): FactorySetupResult => {
        const currentValues = formValuesRef.current;
        const debugContext = createDebugContext(mergedConfig.debug);

        const templateMiddleware = createTemplateExpressionMiddleware({
          externalContext: mergedConfig.externalContext,
          formValues: currentValues,
          debug: debugContext,
        });

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
          state: currentValues,
          middlewares: updatedMiddlewares,
          onSubmit: onSubmitRef.current,
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
    ]);

    if (!validation.valid) {
      return (
        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--schepta-error-bg)",
            border: "1px solid var(--schepta-error-border)",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ color: "var(--schepta-error-text)", margin: "0 0 12px 0" }}>
            Schema Validation Error
          </h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              margin: 0,
              color: "var(--schepta-error-text-muted)",
            }}
          >
            {validation.formattedErrors}
          </pre>
        </div>
      );
    }

    const rootComponentKey = (schema as any)["x-component"] || "FormContainer";

    return (
      <ScheptaFormProvider adapter={formAdapter}>
        <FormRenderer
          componentKey={rootComponentKey}
          schema={schema}
          renderer={renderer}
        />
      </ScheptaFormProvider>
    );
  }
);
