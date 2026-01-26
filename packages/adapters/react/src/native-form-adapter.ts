/**
 * Native React Form Adapter
 * 
 * Implements FormAdapter using React state (useState).
 */

import type { FormAdapter, FieldOptions, ReactiveState } from '@schepta/core';
import { ReactReactiveState } from './reactive-state';

/**
 * Native React form adapter implementation.
 * Uses React state for form value management.
 */
export class NativeReactFormAdapter implements FormAdapter {
  private state: Record<string, any>;
  private setState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  private errors: Record<string, any>;
  private setErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  private validators: Map<string, (value: any) => boolean | string>;
  private listeners: Set<(field: string, value: any) => void>;

  constructor(
    state: Record<string, any>,
    setState: React.Dispatch<React.SetStateAction<Record<string, any>>>,
    errors: Record<string, any> = {},
    setErrors: React.Dispatch<React.SetStateAction<Record<string, any>>> = () => {}
  ) {
    this.state = state;
    this.setState = setState;
    this.errors = errors;
    this.setErrors = setErrors;
    this.validators = new Map();
    this.listeners = new Set();
  }

  /**
   * Update internal state reference (called when state changes)
   */
  updateState(newState: Record<string, any>): void {
    this.state = newState;
  }

  /**
   * Update internal errors reference (called when errors change)
   */
  updateErrors(newErrors: Record<string, any>): void {
    this.errors = newErrors;
  }

  getValues(): Record<string, any> {
    return { ...this.state };
  }

  getValue(field: string): any {
    // Support nested fields like "user.name"
    const parts = field.split('.');
    let value: any = this.state;
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    return value;
  }

  setValue(field: string, value: any): void {
    // Support nested fields like "user.name"
    const parts = field.split('.');
    
    this.setState((prevState) => {
      const newState = { ...prevState };
      
      if (parts.length === 1) {
        newState[field] = value;
      } else {
        // Handle nested path
        let current: any = newState;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (current[part] === undefined || current[part] === null) {
            current[part] = {};
          } else {
            current[part] = { ...current[part] };
          }
          current = current[part];
        }
        current[parts[parts.length - 1]] = value;
      }
      
      return newState;
    });

    // Validate field if validator exists
    this.validateField(field, value);

    // Notify listeners
    this.listeners.forEach(listener => listener(field, value));
  }

  watch(field?: string): ReactiveState<any> {
    if (field) {
      const value = this.getValue(field);
      const state = new ReactReactiveState(value, (newValue) => {
        this.setValue(field, newValue);
      });
      return state;
    } else {
      const state = new ReactReactiveState(this.getValues(), (newValues) => {
        this.setState(newValues);
      });
      return state;
    }
  }

  reset(values?: Record<string, any>): void {
    this.setState(values || {});
    this.setErrors({});
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
    // Optionally remove the field value
    this.setState((prevState) => {
      const newState = { ...prevState };
      delete newState[field];
      return newState;
    });
  }

  getErrors(): Record<string, any> {
    return { ...this.errors };
  }

  getError(field: string): any {
    return this.errors[field];
  }

  setError(field: string, error: any): void {
    this.setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  }

  clearErrors(field?: string): void {
    if (field) {
      this.setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      this.setErrors({});
    }
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(onSubmit: (values: Record<string, any>) => void | Promise<void>): () => void {
    return () => {
      // Run all validators first
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
        this.setErrors(newErrors);
        return;
      }

      // If valid, submit
      onSubmit(this.getValues());
    };
  }

  private validateField(field: string, value: any): void {
    const validator = this.validators.get(field);
    if (validator) {
      const result = validator(value);
      if (result === true) {
        // Clear error for this field
        this.setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        this.setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: typeof result === 'string' ? result : 'Validation failed',
        }));
      }
    }
  }

  /**
   * Subscribe to field changes
   */
  subscribe(callback: (field: string, value: any) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

/**
 * Create a native React form adapter.
 * Use this with useState hooks in your component.
 * 
 * @example
 * ```tsx
 * const [formValues, setFormValues] = useState({});
 * const [errors, setErrors] = useState({});
 * const adapter = createNativeReactFormAdapter(formValues, setFormValues, errors, setErrors);
 * ```
 */
export function createNativeReactFormAdapter(
  state: Record<string, any>,
  setState: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  errors?: Record<string, any>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, any>>>
): NativeReactFormAdapter {
  return new NativeReactFormAdapter(state, setState, errors, setErrors);
}
