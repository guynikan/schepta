/**
 * React Form Factory
 *
 * Renders forms from JSON schemas.
 *
 * The public API (`FormFactoryProps`, `FormFactoryRef`) is preserved for
 * backwards compatibility. Internally the factory is composed on top of the
 * generic `createReactFactory` primitive — all form-specific concerns live in
 * the `useFormSetup` hook below.
 */

import React, { useCallback, useMemo } from 'react';
import type {
  FormSchema,
  ComponentSpec,
  MiddlewareFn,
  FormAdapter,
} from '@schepta/core';
import { hasFormValueTemplates, createFormikValidator } from '@schepta/core';
import { NativeReactFormAdapter } from '@schepta/adapter-react';
import formSchemaDefinition from '@schepta/factories/schemas/form-schema.json';
import { ScheptaFormProvider } from './context/schepta-form-context';
import { defaultComponents } from './defaults/register-default-components';
import { defaultRenderers } from './defaults/register-default-renderers';
import { useScheptaForm } from './hooks/use-schepta-form';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from './create-factory';

/**
 * Ref interface for external form control
 */
export interface FormFactoryRef {
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  reset: (values?: Record<string, any>) => void;
  getValues: () => Record<string, any>;
}

export interface FormFactoryProps extends FactoryBaseProps {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  adapter?: FormAdapter;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /**
   * Validate values against the schema (AJV) before calling `onSubmit`.
   * Defaults to false for backwards compatibility. Set it to true to block
   * submits that fail AJV validation and populate `aria-invalid` errors.
   */
  validateOnSubmit?: boolean;
  debug?: boolean;
}

/**
 * Writes a validator's error map into the adapter in one commit.
 *
 * `NativeReactFormAdapter` exposes `setErrorsMap` so the whole map lands in a
 * single notification; other adapters only have the per-field
 * `FormAdapter` API, so we fall back to clearing and setting field by field.
 */
function commitErrors(adapter: FormAdapter, errors: Record<string, string>): void {
  if (adapter instanceof NativeReactFormAdapter) {
    adapter.setErrorsMap(errors);
    return;
  }
  adapter.clearErrors();
  for (const [field, message] of Object.entries(errors)) {
    adapter.setError(field, message);
  }
}

const useFormSetup: FactorySetupHook<
  FormFactoryProps,
  FormFactoryRef,
  Record<string, any>
> = ({ props }) => {
  const {
    schema,
    initialValues,
    adapter: providedAdapter,
    onSubmit,
    validateOnSubmit = false,
  } = props;

  const { formAdapter, reset } = useScheptaForm(schema, {
    initialValues,
    adapter: providedAdapter,
  });

  // ajv.compile is expensive — keep one compiled validator per schema.
  const validate = useMemo(
    () => (validateOnSubmit ? createFormikValidator(schema) : null),
    [schema, validateOnSubmit]
  );

  /**
   * Runs schema validation, publishes the errors, and only then hands the
   * values to the consumer's `onSubmit`.
   *
   * Errors are committed even on success (as an empty map) so a field that
   * was previously invalid clears its `aria-invalid` and drops its alert.
   */
  const submitWithValidation = useCallback(
    (submitFn: (values: Record<string, any>) => void | Promise<void>) =>
      (values: Record<string, any>) => {
        if (!validate) return submitFn(values);

        const errors = validate(values);
        commitErrors(formAdapter, errors);

        if (Object.keys(errors).length > 0) return;
        return submitFn(values);
      },
    [validate, formAdapter]
  );

  const handleSubmit = useMemo(
    () => (onSubmit ? submitWithValidation(onSubmit) : undefined),
    [onSubmit, submitWithValidation]
  );

  // Only subscribe when the schema actually depends on form values for
  // template resolution. Static schemas never re-render on input.
  const needsFormValueRerender = useMemo(
    () => hasFormValueTemplates(schema),
    [schema]
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (needsFormValueRerender && formAdapter instanceof NativeReactFormAdapter) {
        return formAdapter.subscribeAll(onStoreChange);
      }
      return () => {};
    },
    [needsFormValueRerender, formAdapter]
  );

  const getSnapshot = useCallback(() => {
    if (formAdapter instanceof NativeReactFormAdapter) {
      return formAdapter.getValuesSnapshot();
    }
    return formAdapter.getValues();
  }, [formAdapter]);

  const refApi = useMemo<FormFactoryRef>(
    () => ({
      // Imperative submits go through the same validation path as the
      // built-in submit button, so an external button cannot bypass it.
      submit: (submitFn) =>
        formAdapter.handleSubmit(submitWithValidation(submitFn))(),
      reset: (values) => reset(values),
      getValues: () => formAdapter.getValues(),
    }),
    [formAdapter, reset, submitWithValidation]
  );

  const wrap = useCallback(
    (children: React.ReactNode) => (
      <ScheptaFormProvider adapter={formAdapter}>
        {children}
      </ScheptaFormProvider>
    ),
    [formAdapter]
  );

  return {
    formAdapter,
    onSubmit: handleSubmit,
    subscribe,
    getSnapshot,
    refApi,
    wrap,
  };
};

export const FormFactory = createReactFactory<FormFactoryProps, FormFactoryRef>({
  displayName: 'FormFactory',
  schemaDefinition: formSchemaDefinition,
  rootComponentKey: 'FormContainer',
  defaultComponents,
  defaultRenderers,
  useSetup: useFormSetup,
});
