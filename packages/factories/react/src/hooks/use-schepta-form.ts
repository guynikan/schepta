/**
 * useScheptaForm Hook
 * 
 * Encapsulates native form state management for Schepta forms.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormSchema, FormAdapter } from '@schepta/core';
import { createNativeReactFormAdapter, NativeReactFormAdapter } from '@schepta/adapter-react';
import { buildInitialValuesFromSchema } from '@schepta/core';

export interface ScheptaFormOptions {
  /** Initial values for the form */
  initialValues?: Record<string, any>;
  /** External adapter (optional - for custom implementations) */
  adapter?: FormAdapter;
}

export interface ScheptaFormResult {
  /** The Schepta form adapter */
  formAdapter: FormAdapter;
  /** Current form state (for reactivity) */
  formState: Record<string, any>;
  /** Form errors */
  formErrors: Record<string, any>;
  /** Set form state directly */
  setFormState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  /** Set form errors directly */
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  /** Reset form to initial values */
  reset: (values?: Record<string, any>) => void;
}

/**
 * Hook to setup and manage form state for Schepta forms.
 * Uses native React state.
 * 
 * @param schema - The form schema
 * @param options - Form options including initial values and optional external adapter
 * @returns Form adapter, reactive state, and control functions
 * 
 * @example Basic usage
 * ```tsx
 * const { formAdapter, formState } = useScheptaForm(schema, {
 *   initialValues: { name: 'John' },
 * });
 * ```
 * 
 * @example With custom adapter
 * ```tsx
 * const myAdapter = createCustomAdapter();
 * const { formAdapter, formState } = useScheptaForm(schema, {
 *   adapter: myAdapter,
 * });
 * ```
 */
export function useScheptaForm(
  schema: FormSchema,
  options: ScheptaFormOptions = {}
): ScheptaFormResult {
  const { initialValues, adapter: externalAdapter } = options;

  // Build default values from schema if no initial values provided
  const defaultValues = useMemo(() => {
    const schemaDefaults = buildInitialValuesFromSchema(schema);
    return { ...schemaDefaults, ...initialValues };
  }, [schema, initialValues]);

  const [formState, setFormState] = useState<Record<string, any>>(defaultValues);
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});

  // Create adapter (ref to maintain identity)
  const adapterRef = useRef<FormAdapter | null>(null);

  if (!adapterRef.current) {
    if (externalAdapter) {
      adapterRef.current = externalAdapter;
    } else {
      adapterRef.current = createNativeReactFormAdapter(
        formState,
        setFormState,
        formErrors,
        setFormErrors
      );
    }
  }

  // Update native adapter's internal state reference when state changes
  useEffect(() => {
    if (adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateState(formState);
    }
  }, [formState]);

  // Update native adapter's internal errors reference when errors change
  useEffect(() => {
    if (adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateErrors(formErrors);
    }
  }, [formErrors]);

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues !== undefined) {
      const newDefaults = {
        ...buildInitialValuesFromSchema(schema),
        ...initialValues,
      };
      setFormState(newDefaults);
      setFormErrors({});
    }
  }, [initialValues, schema]);

  // Reset function
  const reset = useMemo(() => {
    return (values?: Record<string, any>) => {
      const resetValues = values || defaultValues;
      setFormState(resetValues);
      setFormErrors({});
    };
  }, [defaultValues]);

  return {
    formAdapter: adapterRef.current!,
    formState,
    formErrors,
    setFormState,
    setFormErrors,
    reset,
  };
}

