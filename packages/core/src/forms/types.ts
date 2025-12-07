/**
 * Form Management Abstraction
 * 
 * Provides framework-agnostic interface for form state management.
 * Allows integration with react-hook-form, vee-validate, or custom implementations.
 */

/**
 * Form adapter interface - abstracts form library differences
 */
export interface FormAdapter {
  /** Get all form values */
  getValues(): Record<string, any>;
  
  /** Get value for a specific field */
  getValue(field: string): any;
  
  /** Set value for a specific field */
  setValue(field: string, value: any): void;
  
  /** Watch form values - returns reactive state */
  watch(field?: string): ReactiveState<any>;
  
  /** Reset form to initial or provided values */
  reset(values?: Record<string, any>): void;
  
  /** Register a field */
  register(field: string, options?: FieldOptions): void;
  
  /** Unregister a field */
  unregister(field: string): void;
  
  /** Get form errors */
  getErrors(): Record<string, any>;
  
  /** Get error for a specific field */
  getError(field: string): any;
  
  /** Set error for a specific field */
  setError(field: string, error: any): void;
  
  /** Clear errors */
  clearErrors(field?: string): void;
  
  /** Check if form is valid */
  isValid(): boolean;
  
  /** Submit handler */
  handleSubmit(onSubmit: (values: Record<string, any>) => void | Promise<void>): () => void;
}

/**
 * Field registration options
 */
export interface FieldOptions {
  required?: boolean;
  validate?: (value: any) => boolean | string;
  defaultValue?: any;
}

import type { ReactiveState } from '../runtime/types';

