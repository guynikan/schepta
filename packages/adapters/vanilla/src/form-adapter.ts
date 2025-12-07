/**
 * Vanilla JS Form Adapter
 * 
 * Implements FormAdapter using manual state management
 */

import type { FormAdapter, FieldOptions, ReactiveState } from '@spectra/core';
import { VanillaReactiveState } from './reactive-state';
import { EventEmitter } from './event-emitter';

/**
 * Vanilla JS form adapter implementation
 */
export class VanillaFormAdapter implements FormAdapter {
  private values: Record<string, any>;
  private errors: Record<string, any>;
  private validators: Map<string, (value: any) => boolean | string>;
  private emitter: EventEmitter;

  constructor(initialValues: Record<string, any> = {}) {
    this.values = { ...initialValues };
    this.errors = {};
    this.validators = new Map();
    this.emitter = new EventEmitter();
  }

  getValues(): Record<string, any> {
    return { ...this.values };
  }

  getValue(field: string): any {
    return this.values[field];
  }

  setValue(field: string, value: any): void {
    const oldValue = this.values[field];
    this.values[field] = value;
    this.validateField(field);
    this.emitter.emit('change', { field, value, oldValue });
    this.emitter.emit(`change:${field}`, { value, oldValue });
  }

  watch(field?: string): ReactiveState<any> {
    if (field) {
      const state = new VanillaReactiveState(this.values[field]);
      this.emitter.on(`change:${field}`, ({ value }: any) => {
        state.set(value);
      });
      return state;
    } else {
      const state = new VanillaReactiveState(this.getValues());
      this.emitter.on('change', () => {
        state.set(this.getValues());
      });
      return state;
    }
  }

  reset(values?: Record<string, any>): void {
    if (values) {
      this.values = { ...values };
    } else {
      this.values = {};
    }
    this.errors = {};
    this.emitter.emit('reset', { values: this.values });
  }

  register(field: string, options?: FieldOptions): void {
    if (options?.validate) {
      this.validators.set(field, options.validate);
    }
    if (options?.defaultValue !== undefined) {
      this.values[field] = options.defaultValue;
    }
  }

  unregister(field: string): void {
    delete this.values[field];
    delete this.errors[field];
    this.validators.delete(field);
  }

  getErrors(): Record<string, any> {
    return { ...this.errors };
  }

  getError(field: string): any {
    return this.errors[field];
  }

  setError(field: string, error: any): void {
    this.errors[field] = error;
  }

  clearErrors(field?: string): void {
    if (field) {
      delete this.errors[field];
    } else {
      this.errors = {};
    }
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(onSubmit: (values: Record<string, any>) => void | Promise<void>): () => void {
    return () => {
      if (this.isValid()) {
        onSubmit(this.getValues());
      }
    };
  }

  private validateField(field: string): void {
    const validator = this.validators.get(field);
    if (validator) {
      const result = validator(this.values[field]);
      if (result === true) {
        delete this.errors[field];
      } else if (typeof result === 'string') {
        this.errors[field] = result;
      } else {
        this.errors[field] = 'Validation failed';
      }
    }
  }
}

/**
 * Create a Vanilla JS form adapter
 */
export function createVanillaFormAdapter(initialValues?: Record<string, any>): VanillaFormAdapter {
  return new VanillaFormAdapter(initialValues);
}

