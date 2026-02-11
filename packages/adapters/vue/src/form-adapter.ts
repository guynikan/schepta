/**
 * Vue Form Adapter
 *
 * Implements FormAdapter using Vue reactive state
 */

import { ref, reactive, watch } from 'vue';
import type { FormAdapter, FieldOptions, ReactiveState } from '@schepta/core';
import { VueReactiveState } from './reactive-state';

function getNestedValue(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let value: any = obj;
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  return value;
}

function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let current: any = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    } else if (typeof current[part] !== 'object') {
      current[part] = {};
    } else {
      current[part] = { ...current[part] };
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

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

  /**
   * Get the reactive values object (for framework integration).
   * Mutations to this object are reflected in the adapter state.
   */
  getState(): Record<string, any> {
    return this.values;
  }

  getValue(field: string): any {
    return getNestedValue(this.values, field);
  }

  setValue(field: string, value: any): void {
    setNestedValue(this.values, field, value);
    this.validateField(field, value);
  }

  watch(field?: string): ReactiveState<any> {
    if (field) {
      const fieldRef = ref(this.getValue(field));
      watch(
        () => this.getValue(field),
        (newValue) => {
          fieldRef.value = newValue;
        },
        { deep: true }
      );
      return new VueReactiveState(fieldRef);
    } else {
      const allValuesRef = ref(this.getValues());
      watch(
        () => this.values,
        () => {
          allValuesRef.value = { ...this.values };
        },
        { deep: true }
      );
      return new VueReactiveState(allValuesRef);
    }
  }

  reset(values?: Record<string, any>): void {
    if (values) {
      Object.keys(this.values).forEach((key) => delete this.values[key]);
      Object.assign(this.values, values);
    } else {
      Object.keys(this.values).forEach((key) => delete this.values[key]);
    }
    Object.keys(this.errors).forEach((key) => delete this.errors[key]);
  }

  register(field: string, options?: FieldOptions): void {
    if (options?.validate) {
      this.validators.set(field, options.validate);
    }
    if (options?.defaultValue !== undefined && this.getValue(field) === undefined) {
      this.setValue(field, options.defaultValue);
    }
  }

  unregister(field: string): void {
    this.validators.delete(field);
    if (field.indexOf('.') === -1) {
      delete this.values[field];
    }
    delete this.errors[field];
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
      Object.keys(this.errors).forEach((key) => delete this.errors[key]);
    }
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(onSubmit: (values: Record<string, any>) => void | Promise<void>): () => void {
    return () => {
      let hasErrors = false;
      const newErrors: Record<string, any> = {};

      this.validators.forEach((validator, field) => {
        const value = this.getValue(field);
        const result = validator(value);
        if (result !== true) {
          hasErrors = true;
          newErrors[field] = typeof result === 'string' ? result : 'Validation failed';
        }
      });

      if (hasErrors) {
        Object.keys(this.errors).forEach((key) => delete this.errors[key]);
        Object.assign(this.errors, newErrors);
        return;
      }

      onSubmit(this.getValues());
    };
  }

  private validateField(field: string, value: any): void {
    const validator = this.validators.get(field);
    if (validator) {
      const result = validator(value);
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
