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
import { hasFormValueTemplates } from '@schepta/core';
import { NativeReactFormAdapter } from '@schepta/adapter-react';
import formSchemaDefinition from '@schepta/factories/schemas/form-schema.json';
import { ScheptaFormProvider } from './context/schepta-form-context';
import { defaultComponents } from './defaults/register-default-components';
import { defaultRenderers } from './defaults/register-default-renderers';
import { injectScheptaTokens } from './schepta-tokens';
import { useScheptaForm } from './hooks/use-schepta-form';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from './create-factory';

injectScheptaTokens();

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
  debug?: boolean;
}

const useFormSetup: FactorySetupHook<
  FormFactoryProps,
  FormFactoryRef,
  Record<string, any>
> = ({ props }) => {
  const { schema, initialValues, adapter: providedAdapter, onSubmit } = props;

  const { formAdapter, reset } = useScheptaForm(schema, {
    initialValues,
    adapter: providedAdapter,
  });

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
      submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
      reset: (values) => reset(values),
      getValues: () => formAdapter.getValues(),
    }),
    [formAdapter, reset]
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
    onSubmit,
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
