/**
 * useScheptaForm Hook
 * 
 * Encapsulates react-hook-form setup and state management for Schepta forms.
 */

import { useEffect, useMemo } from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import type { FormSchema, FormAdapter } from '@schepta/core';
import { createReactHookFormAdapter } from '@schepta/adapter-react';
import { buildInitialValuesFromSchema } from '@schepta/core';

export interface ScheptaFormOptions {
  /** External form context (if managing form state externally) */
  formContext?: UseFormReturn<any>;
  /** Initial values for the form */
  initialValues?: Record<string, any>;
}

export interface ScheptaFormResult {
  /** The react-hook-form context */
  formContext: UseFormReturn<any>;
  /** The Schepta form adapter */
  formAdapter: FormAdapter;
  /** Current form state (watched for reactivity) */
  formState: Record<string, any>;
}

/**
 * Hook to setup and manage form state for Schepta forms
 * 
 * @param schema - The form schema
 * @param options - Form options including external context and initial values
 * @returns Form context, adapter, and reactive state
 */
export function useScheptaForm(
  schema: FormSchema,
  options: ScheptaFormOptions = {}
): ScheptaFormResult {
  const { formContext: providedFormContext, initialValues } = options;

  // Create default form context if not provided
  const defaultFormContext = useForm({
    defaultValues: initialValues || buildInitialValuesFromSchema(schema),
  });

  // Use provided context or default
  const formContext = providedFormContext || defaultFormContext;

  // Create form adapter (memoized)
  const formAdapter = useMemo(
    () => createReactHookFormAdapter(formContext),
    [formContext]
  );

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues !== undefined) {
      const defaultValues = {
        ...buildInitialValuesFromSchema(schema),
        ...initialValues,
      };
      formContext.reset(defaultValues);
    }
  }, [formContext, initialValues, schema]);

  // Watch form state to trigger re-renders when values change
  // This ensures template expressions with $formValues are updated
  const formState = useWatch({
    control: formContext.control,
  });

  return {
    formContext,
    formAdapter,
    formState: formState as Record<string, any>,
  };
}

