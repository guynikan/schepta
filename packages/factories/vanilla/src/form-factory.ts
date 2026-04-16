/**
 * Vanilla JS Form Factory
 *
 * Renders forms from JSON schemas. The public API (`FormFactoryOptions`,
 * `FormFactoryResult`) is preserved for backwards compatibility. Internally
 * the factory is composed on top of the generic `createVanillaFactory`
 * primitive — form-specific concerns live in the `useFormSetup` callback.
 */

import type { FormSchema, ComponentSpec, FormAdapter, MiddlewareFn } from '@schepta/core';
import { VanillaFormAdapter, createVanillaFormAdapter } from '@schepta/adapter-vanilla';
import { buildInitialValues, hasFormValueTemplates } from '@schepta/core';
import formSchemaDefinition from '@schepta/factories/schemas/form-schema.json';
import { defaultComponents } from './defaults/register-default-components';
import { createDefaultRenderers as createVanillaFormRenderers } from './defaults/register-default-renderers';
import { injectScheptaTokens } from './schepta-tokens';
import {
  createVanillaFactory,
  type VanillaFactoryBaseOptions,
  type VanillaFactorySetupFn,
  type VanillaFactorySetupReturn,
} from './create-factory';

export interface FormFactoryOptions extends VanillaFactoryBaseOptions {
  schema: FormSchema;
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  middlewares?: MiddlewareFn[];
  externalContext?: Record<string, any>;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  debug?: boolean;
  container: HTMLElement;
}

export interface FormFactoryApi {
  /** The form adapter for direct access */
  formAdapter: FormAdapter;
  /** Submit the form with the provided handler */
  submit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => void;
  /** Reset form to initial or provided values */
  reset: (values?: Record<string, any>) => void;
  /** Get current form values */
  getValues: () => Record<string, any>;
}

export interface FormFactoryResult extends FormFactoryApi {
  /** Destroy the form and clean up */
  destroy: () => void;
}

interface FocusSnapshot {
  activeName: string | null;
  activeValue: string | null;
}

const useFormSetup: VanillaFactorySetupFn<FormFactoryOptions, FormFactoryApi> = ({
  options,
}) => {
  injectScheptaTokens();

  const defaultValues = options.initialValues || buildInitialValues(options.schema);
  const formAdapter = createVanillaFormAdapter(defaultValues);

  const api: FormFactoryApi = {
    formAdapter,
    submit: (submitFn) => formAdapter.handleSubmit(submitFn)(),
    reset: (values) => formAdapter.reset(values),
    getValues: () => formAdapter.getValues(),
  };

  const needsReactiveRerender = hasFormValueTemplates(options.schema);

  const setup: VanillaFactorySetupReturn<FormFactoryApi> = {
    getState: () => formAdapter.getValues(),
    formAdapter,
    onSubmit: options.onSubmit,
    api,
  };

  if (needsReactiveRerender && formAdapter instanceof VanillaFormAdapter) {
    setup.subscribe = (scheduleRerender) => {
      const unsubChange = formAdapter.subscribe(scheduleRerender);
      const unsubReset = formAdapter.onReset(scheduleRerender);
      return () => {
        unsubChange();
        unsubReset();
      };
    };

    setup.onBeforeRerender = (currentRoot): FocusSnapshot => {
      const active = document.activeElement as HTMLInputElement | null;
      const isInsideForm = active !== null && currentRoot?.contains(active);
      return {
        activeName: isInsideForm ? active.getAttribute('name') ?? null : null,
        activeValue: isInsideForm ? active.value ?? null : null,
      };
    };

    setup.onAfterRerender = (newRoot, snapshot: FocusSnapshot) => {
      if (snapshot.activeName && newRoot) {
        const restored = newRoot.querySelector<HTMLElement>(
          `[name="${snapshot.activeName}"]`
        );
        if (restored) {
          restored.focus();
          if (snapshot.activeValue !== null && 'value' in restored) {
            (restored as HTMLInputElement).value = snapshot.activeValue;
          }
        }
      }
    };
  }

  return setup;
};

export const createFormFactory = createVanillaFactory<FormFactoryOptions, FormFactoryApi>({
  schemaDefinition: formSchemaDefinition as object,
  rootComponentKey: 'FormContainer',
  defaultComponents,
  createDefaultRenderers: (setup) =>
    setup.formAdapter ? createVanillaFormRenderers(setup.formAdapter) : {},
  setup: useFormSetup,
});
