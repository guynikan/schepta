/**
 * Schepta Form Context
 *
 * Provides the form adapter to child components. The context value is
 * intentionally stable — it never changes after mount — so no child
 * component re-renders because of a context update when the user types.
 *
 * Field reactivity is handled entirely by useSyncExternalStore inside
 * useScheptaFieldValue, bypassing the React context diffing algorithm.
 */

import React, { createContext, useContext, useMemo, useState, useRef, useEffect, useSyncExternalStore, useCallback } from 'react';
import type { FormAdapter } from '@schepta/core';
import { NativeReactFormAdapter, createNativeReactFormAdapter } from '@schepta/adapter-react';

/**
 * Context type — only the adapter, which is stable for the lifetime of the form.
 */
interface ScheptaFormContextType {
  adapter: FormAdapter;
}

const ScheptaFormContext = createContext<ScheptaFormContextType | null>(null);

/**
 * Props for ScheptaFormProvider
 */
export interface ScheptaFormProviderProps {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
  /** Pre-built adapter from FormFactory (preferred) */
  adapter?: FormAdapter;
}

/**
 * Provides a stable context with the form adapter.
 * When used inside FormFactory, the adapter is passed directly.
 * When used standalone, an internal NativeReactFormAdapter is created.
 */
export function ScheptaFormProvider({
  children,
  initialValues = {},
  adapter: externalAdapter,
}: ScheptaFormProviderProps) {
  const [errors, setErrors] = useState<Record<string, any>>({});

  const adapterRef = useRef<FormAdapter | null>(null);
  if (!adapterRef.current) {
    if (externalAdapter) {
      adapterRef.current = externalAdapter;
    } else {
      adapterRef.current = createNativeReactFormAdapter(initialValues, errors, setErrors);
    }
  }

  // Keep errors in sync for standalone usage
  useEffect(() => {
    if (adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateErrors(errors);
    }
  }, [errors]);

  // Context value is stable — adapter identity never changes after mount
  const contextValue = useMemo<ScheptaFormContextType>(
    () => ({ adapter: adapterRef.current! }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ScheptaFormContext.Provider value={contextValue}>
      {children}
    </ScheptaFormContext.Provider>
  );
}

/**
 * Hook to access the form adapter from context.
 *
 * @returns The form adapter instance
 * @throws Error if used outside of ScheptaFormProvider
 */
export function useScheptaFormAdapter(): FormAdapter {
  const context = useContext(ScheptaFormContext);

  if (!context) {
    throw new Error(
      'useScheptaFormAdapter must be used within a ScheptaFormProvider. ' +
      'Make sure your component is wrapped with ScheptaFormProvider or FormFactory.'
    );
  }

  return context.adapter;
}

/**
 * Hook to access all form values reactively.
 * Uses useSyncExternalStore so only this hook's consumer re-renders (not the whole tree).
 */
export function useScheptaFormValues(): Record<string, any> {
  const context = useContext(ScheptaFormContext);

  if (!context) {
    throw new Error('useScheptaFormValues must be used within a ScheptaFormProvider.');
  }

  const adapter = context.adapter;

  if (adapter instanceof NativeReactFormAdapter) {
    const subscribe = useCallback(
      (onStoreChange: () => void) => adapter.subscribeAll(onStoreChange),
      [adapter]
    );
    const getSnapshot = useCallback(
      () => adapter.getValuesSnapshot(),
      [adapter]
    );
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  // Fallback for custom adapters: no fine-grained reactivity
  return adapter.getValues();
}

/**
 * Hook to get a specific field value reactively.
 * Uses useSyncExternalStore for field-level granularity when the adapter supports it.
 * Only the field that changed triggers a re-render — FormFactory is unaffected.
 *
 * @param field - The field name (supports dot notation for nested fields)
 * @returns The field value
 */
export function useScheptaFieldValue(field: string): any {
  const context = useContext(ScheptaFormContext);

  if (!context) {
    throw new Error('useScheptaFieldValue must be used within a ScheptaFormProvider.');
  }

  const adapter = context.adapter;

  // Fast path: NativeReactFormAdapter supports field-level subscription
  if (adapter instanceof NativeReactFormAdapter) {
    const subscribe = useCallback(
      (onStoreChange: () => void) => adapter.subscribeField(field, onStoreChange),
      [adapter, field]
    );
    const getSnapshot = useCallback(
      () => adapter.getFieldSnapshot(field),
      [adapter, field]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  // Fallback for custom adapters: direct read (not reactive per-field)
  const parts = field.split('.');
  let value: any = adapter.getValues();
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }

  return value;
}

/**
 * Hook to get a specific field's validation error reactively.
 *
 * Mirrors {@link useScheptaFieldValue}: only the field whose error changed
 * re-renders. This is what feeds `aria-invalid` and the `role="alert"` error
 * message on the default inputs — without a reactive read the field would
 * render its error one commit late, after the assistive technology has
 * already moved on.
 *
 * @param field - The field name (dot notation for nested fields)
 * @returns The error message, or undefined when the field is valid
 */
export function useScheptaFieldError(field: string): any {
  const context = useContext(ScheptaFormContext);

  if (!context) {
    throw new Error('useScheptaFieldError must be used within a ScheptaFormProvider.');
  }

  const adapter = context.adapter;

  if (adapter instanceof NativeReactFormAdapter) {
    const subscribe = useCallback(
      (onStoreChange: () => void) => adapter.subscribeError(field, onStoreChange),
      [adapter, field]
    );
    const getSnapshot = useCallback(
      () => adapter.getErrorSnapshot(field),
      [adapter, field]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  // Fallback for custom adapters: direct read (not reactive)
  return adapter.getError(field);
}

/**
 * Like {@link useScheptaFieldError}, but returns `undefined` instead of
 * throwing when there is no provider.
 *
 * The default input components use this so they stay usable outside a
 * `FormFactory` (standalone, or inside a non-form factory), where there is no
 * error source at all.
 */
export function useOptionalScheptaFieldError(field: string): any {
  const context = useContext(ScheptaFormContext);
  const adapter = context?.adapter;
  const isNative = adapter instanceof NativeReactFormAdapter;

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      isNative ? adapter.subscribeError(field, onStoreChange) : () => {},
    [adapter, field, isNative]
  );
  const getSnapshot = useCallback(
    () => (isNative ? adapter.getErrorSnapshot(field) : undefined),
    [adapter, field, isNative]
  );

  const nativeError = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (isNative) return nativeError;
  return adapter?.getError(field);
}

/**
 * Hook to read all form errors reactively.
 *
 * Used by the error summary in `DefaultFormContainer`, which needs the full
 * map rather than a single field.
 */
export function useScheptaFormErrors(): Record<string, any> {
  const context = useContext(ScheptaFormContext);

  if (!context) {
    throw new Error('useScheptaFormErrors must be used within a ScheptaFormProvider.');
  }

  const adapter = context.adapter;

  if (adapter instanceof NativeReactFormAdapter) {
    const subscribe = useCallback(
      (onStoreChange: () => void) => adapter.subscribeErrors(onStoreChange),
      [adapter]
    );
    const getSnapshot = useCallback(
      () => adapter.getErrorsSnapshot(),
      [adapter]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  // Fallback for custom adapters: no fine-grained reactivity
  return adapter.getErrors();
}

// Export context for advanced usage
export { ScheptaFormContext };
