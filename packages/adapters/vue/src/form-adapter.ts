/**
 * Vue Form Adapter
 * 
 * Implements FormAdapter using Vue reactive state
 */

import { ref, reactive, watch, type Ref } from 'vue';
import type { FormAdapter, FieldOptions, ReactiveState } from '@schepta/core';
import { VueReactiveState } from './reactive-state';

/**
 * Vue form adapter implementation
 */
export class VueFormAdapter implements FormAdapter {
  private values: Record<string, any>;
  private errors: Record<string, any>;
  private validators: Map<string, (value: any) => boolean | string>;

  constructor(initialValues: Record<string, any> = {}) {
    this.values = reactive({ ...initialValues });
    this.errors = reactive({});
    this.validators = new Map();
  }

  getValues(): Record<string, any> {
    return { ...this.values };
  }

  getValue(field: string): any {
    return this.values[field];
  }

  setValue(field: string, value: any): void {
    this.values[field] = value;
    // Validate on set
    this.validateField(field);
  }

  watch(field?: string): ReactiveState<any> {
    if (field) {
      const fieldRef = ref(this.values[field]);
      watch(() => this.values[field], (newValue) => {
        fieldRef.value = newValue;
      });
      return new VueReactiveState(fieldRef);
    } else {
      const allValuesRef = ref(this.getValues());
      watch(() => this.values, (newValues) => {
        allValuesRef.value = { ...newValues };
      }, { deep: true });
      return new VueReactiveState(allValuesRef);
    }
  }

  reset(values?: Record<string, any>): void {
    if (values) {
      Object.assign(this.values, values);
    } else {
      Object.keys(this.values).forEach(key => {
        delete this.values[key];
      });
    }
    Object.keys(this.errors).forEach(key => {
      delete this.errors[key];
    });
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
      Object.keys(this.errors).forEach(key => {
        delete this.errors[key];
      });
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
 * Create a Vue form adapter
 */
export function createVueFormAdapter(initialValues?: Record<string, any>): VueFormAdapter {
  return new VueFormAdapter(initialValues);
}

