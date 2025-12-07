/**
 * React Hook Form Adapter
 * 
 * Implements FormAdapter using react-hook-form
 */

import type { UseFormReturn } from 'react-hook-form';
import type { FormAdapter, FieldOptions, ReactiveState } from '@spectra/core';
import { ReactReactiveState } from './reactive-state';

/**
 * React Hook Form adapter implementation
 */
export class ReactHookFormAdapter implements FormAdapter {
  private form: UseFormReturn<any>;

  constructor(form: UseFormReturn<any>) {
    this.form = form;
  }

  getValues(): Record<string, any> {
    return this.form.getValues();
  }

  getValue(field: string): any {
    return this.form.getValues(field);
  }

  setValue(field: string, value: any): void {
    this.form.setValue(field, value);
  }

  watch(field?: string): ReactiveState<any> {
    const watchedValue = field 
      ? this.form.watch(field)
      : this.form.watch();
    
    return new ReactReactiveState(watchedValue, (newValue) => {
      if (field) {
        this.setValue(field, newValue);
      }
    });
  }

  reset(values?: Record<string, any>): void {
    this.form.reset(values);
  }

  register(field: string, options?: FieldOptions): void {
    this.form.register(field, {
      required: options?.required,
      validate: options?.validate,
    });
  }

  unregister(field: string): void {
    this.form.unregister(field);
  }

  getErrors(): Record<string, any> {
    return this.form.formState.errors;
  }

  getError(field: string): any {
    return this.form.formState.errors[field];
  }

  setError(field: string, error: any): void {
    this.form.setError(field, error);
  }

  clearErrors(field?: string): void {
    if (field) {
      this.form.clearErrors(field);
    } else {
      this.form.clearErrors();
    }
  }

  isValid(): boolean {
    return this.form.formState.isValid;
  }

  handleSubmit(onSubmit: (values: Record<string, any>) => void | Promise<void>): () => void {
    return this.form.handleSubmit(onSubmit);
  }
}

/**
 * Create a React Hook Form adapter
 */
export function createReactHookFormAdapter(form: UseFormReturn<any>): ReactHookFormAdapter {
  return new ReactHookFormAdapter(form);
}

