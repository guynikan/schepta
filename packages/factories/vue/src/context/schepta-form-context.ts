/**
 * Schepta Form Context
 *
 * Provides form adapter to child components without external dependencies.
 * This is the native form state management system for Schepta.
 */

import { provide, inject, defineComponent, h, type InjectionKey } from 'vue';
import type { FormAdapter } from '@schepta/core';

/**
 * Context type for Schepta form adapter
 */
export interface ScheptaFormContextType {
  /** The form adapter instance */
  adapter: FormAdapter;
  /** Current form values (for reactivity) */
  values: Record<string, any>;
}

const SCHEPTA_FORM_KEY: InjectionKey<ScheptaFormContextType> = Symbol('schepta-form');

/**
 * Props for ScheptaFormProvider
 */
export interface ScheptaFormProviderProps {
  /** External adapter (from FormFactory) */
  adapter: FormAdapter;
  /** Current form values (for reactivity) */
  values: Record<string, any>;
}

/**
 * Provider component that wraps form content and provides the form adapter.
 */
export const ScheptaFormProvider = defineComponent({
  name: 'ScheptaFormProvider',
  props: {
    adapter: {
      type: Object as () => FormAdapter,
      required: true,
    },
    values: {
      type: Object as () => Record<string, any>,
      required: true,
    },
  },
  setup(props, { slots }) {
    // Provide reactive context that updates when props change
    const contextValue = {
      get adapter() {
        return props.adapter;
      },
      get values() {
        return props.values;
      },
    };
    provide(SCHEPTA_FORM_KEY, contextValue);
    return () => slots.default?.();
  },
});

/**
 * Composable to access the form adapter from context.
 *
 * @returns The form adapter instance
 * @throws Error if used outside of ScheptaFormProvider
 */
export function useScheptaFormAdapter(): FormAdapter {
  const context = inject(SCHEPTA_FORM_KEY);
  if (!context) {
    throw new Error(
      'useScheptaFormAdapter must be used within a ScheptaFormProvider. ' +
        'Make sure your component is wrapped with ScheptaFormProvider or FormFactory.'
    );
  }
  return context.adapter;
}

/**
 * Composable to access form values reactively.
 *
 * @returns Current form values
 */
export function useScheptaFormValues(): Record<string, any> {
  const context = inject(SCHEPTA_FORM_KEY);
  if (!context) {
    throw new Error('useScheptaFormValues must be used within a ScheptaFormProvider.');
  }
  return context.values;
}

/**
 * Composable to get a specific field value reactively.
 *
 * @param field - The field name (supports dot notation for nested fields)
 * @returns The field value
 */
export function useScheptaFieldValue(field: string): any {
  const context = inject(SCHEPTA_FORM_KEY);
  if (!context) {
    throw new Error('useScheptaFieldValue must be used within a ScheptaFormProvider.');
  }
  const parts = field.split('.');
  let value: any = context.values;
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  return value;
}
