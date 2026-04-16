/**
 * useScheptaForm Hook
 *
 * Sets up a self-contained form adapter. Form values live inside
 * NativeReactFormAdapter (plain JS state + subscribers) and never in
 * React useState — so FormFactory does not re-render on every keystroke.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormSchema, FormAdapter } from '@schepta/core';
import { createNativeReactFormAdapter, NativeReactFormAdapter } from '@schepta/adapter-react';
import { buildInitialValues } from '@schepta/core';

export interface ScheptaFormOptions {
  /** Initial values for the form */
  initialValues?: Record<string, any>;
  /** External adapter (optional - for custom implementations) */
  adapter?: FormAdapter;
}

export interface ScheptaFormResult {
  /** The Schepta form adapter */
  formAdapter: FormAdapter;
  /** Form errors (React state — only changes on validation) */
  formErrors: Record<string, any>;
  /** Set form errors directly */
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  /** Reset form to initial or provided values */
  reset: (values?: Record<string, any>) => void;
}

/**
 * Hook to setup and manage form state for Schepta forms.
 *
 * The adapter holds form values internally (not in React useState), so
 * setValue never causes FormFactory to re-render. Field components
 * subscribe via useSyncExternalStore for isolated, granular updates.
 *
 * @example Basic usage
 * ```tsx
 * const { formAdapter, reset } = useScheptaForm(schema, {
 *   initialValues: { name: 'John' },
 * });
 * ```
 *
 * @example With custom adapter
 * ```tsx
 * const myAdapter = createCustomAdapter();
 * const { formAdapter } = useScheptaForm(schema, { adapter: myAdapter });
 * ```
 */
export function useScheptaForm(
  schema: FormSchema,
  options: ScheptaFormOptions = {}
): ScheptaFormResult {
  const { initialValues, adapter: externalAdapter } = options;

  // Build initial values from schema defaults + provided overrides (stable reference)
  const defaultValues = useMemo(() => {
    const schemaDefaults = buildInitialValues(schema);
    return { ...schemaDefaults, ...initialValues };
  }, [schema, initialValues]);

  const [formErrors, setFormErrors] = useState<Record<string, any>>({});

  // Create adapter once (ref to maintain identity)
  const adapterRef = useRef<FormAdapter | null>(null);
  if (!adapterRef.current) {
    if (externalAdapter) {
      adapterRef.current = externalAdapter;
    } else {
      adapterRef.current = createNativeReactFormAdapter(
        defaultValues,
        formErrors,
        setFormErrors
      );
    }
  }

  // Keep errors reference in sync (adapter uses setErrors from React)
  useEffect(() => {
    if (adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateErrors(formErrors);
    }
  }, [formErrors]);

  // When initialValues prop changes from outside, reset the adapter state
  useEffect(() => {
    if (initialValues !== undefined && adapterRef.current instanceof NativeReactFormAdapter) {
      const newDefaults = {
        ...buildInitialValues(schema),
        ...initialValues,
      };
      adapterRef.current.setValues(newDefaults);
      setFormErrors({});
    }
  }, [initialValues, schema]);

  const reset = useMemo(() => {
    return (values?: Record<string, any>) => {
      const resetValues = values ?? defaultValues;
      if (adapterRef.current instanceof NativeReactFormAdapter) {
        adapterRef.current.setValues(resetValues);
      }
      setFormErrors({});
    };
  }, [defaultValues]);

  return {
    formAdapter: adapterRef.current!,
    formErrors,
    setFormErrors,
    reset,
  };
}
