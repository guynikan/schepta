/**
 * Schepta Form Context
 * 
 * Provides form adapter to child components without external dependencies.
 * This is the native form state management system for Schepta.
 */

import React, { createContext, useContext, useMemo, useState, useRef, useEffect } from 'react';
import type { FormAdapter } from '@schepta/core';
import { NativeReactFormAdapter, createNativeReactFormAdapter } from '@schepta/adapter-react';

/**
 * Context type for Schepta form adapter
 */
interface ScheptaFormContextType {
  /** The form adapter instance */
  adapter: FormAdapter;
  /** Current form values (for reactivity) */
  values: Record<string, any>;
}

/**
 * React context for the form adapter
 */
const ScheptaFormContext = createContext<ScheptaFormContextType | null>(null);

/**
 * Props for ScheptaFormProvider
 */
export interface ScheptaFormProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Initial form values */
  initialValues?: Record<string, any>;
  /** External adapter (optional - for custom implementations) */
  adapter?: FormAdapter;
  /** Current form values (for reactivity - passed from FormFactory) */
  values?: Record<string, any>;
}

/**
 * Provider component that wraps form content and provides the form adapter.
 * 
 * @example Using with default native adapter
 * ```tsx
 * <ScheptaFormProvider initialValues={{ name: '' }}>
 *   <FormFields />
 * </ScheptaFormProvider>
 * ```
 * 
 * @example Using with custom adapter and values
 * ```tsx
 * const myAdapter = createCustomAdapter();
 * <ScheptaFormProvider adapter={myAdapter} values={currentValues}>
 *   <FormFields />
 * </ScheptaFormProvider>
 * ```
 */
export function ScheptaFormProvider({
  children,
  initialValues = {},
  adapter: externalAdapter,
  values: externalValues,
}: ScheptaFormProviderProps) {
  // If external values are provided (from FormFactory), use them
  // Otherwise, create our own state management
  const [internalValues, setInternalValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  // Use external values if provided, otherwise use internal state
  const values = externalValues ?? internalValues;
  
  // Create or use provided adapter
  const adapterRef = useRef<FormAdapter | null>(null);
  
  if (!adapterRef.current) {
    if (externalAdapter) {
      adapterRef.current = externalAdapter;
    } else {
      adapterRef.current = createNativeReactFormAdapter(internalValues, setInternalValues, errors, setErrors);
    }
  }

  // Update native adapter's internal state reference when internal values change
  // (only if we're using internal state management)
  useEffect(() => {
    if (!externalValues && adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateState(internalValues);
    }
  }, [internalValues, externalValues]);

  // Update native adapter's internal errors reference when errors change
  useEffect(() => {
    if (adapterRef.current instanceof NativeReactFormAdapter) {
      adapterRef.current.updateErrors(errors);
    }
  }, [errors]);

  const contextValue = useMemo<ScheptaFormContextType>(() => ({
    adapter: adapterRef.current!,
    values,
  }), [values]);

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
 * 
 * @example
 * ```tsx
 * function MyField() {
 *   const adapter = useScheptaFormAdapter();
 *   const value = adapter.getValue('fieldName');
 *   return <input value={value} onChange={(e) => adapter.setValue('fieldName', e.target.value)} />;
 * }
 * ```
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
 * Hook to access form values reactively.
 * Triggers re-render when form values change.
 * 
 * @returns Current form values
 */
export function useScheptaFormValues(): Record<string, any> {
  const context = useContext(ScheptaFormContext);
  
  if (!context) {
    throw new Error(
      'useScheptaFormValues must be used within a ScheptaFormProvider.'
    );
  }
  
  return context.values;
}

/**
 * Hook to get a specific field value reactively.
 * 
 * @param field - The field name (supports dot notation for nested fields)
 * @returns The field value
 */
export function useScheptaFieldValue(field: string): any {
  const context = useContext(ScheptaFormContext);
  
  if (!context) {
    throw new Error(
      'useScheptaFieldValue must be used within a ScheptaFormProvider.'
    );
  }
  
  // Support nested fields
  const parts = field.split('.');
  let value: any = context.values;
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  
  return value;
}

// Export context for advanced usage
export { ScheptaFormContext };
