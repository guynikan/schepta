/**
 * Native React Form Adapter
 *
 * Implements FormAdapter using internal JS state + subscriber notifications.
 * React state (useState) is NOT used for field updates — the adapter is
 * self-contained. Field reactivity is handled by useSyncExternalStore via
 * subscribeField / subscribeAll. This ensures that setValue never triggers
 * a FormFactory re-render; only the subscribed DefaultFieldRenderer re-renders.
 */

import type { FormAdapter, FieldOptions, ReactiveState } from '@schepta/core';
import { ReactReactiveState } from './reactive-state';

/**
 * Native React form adapter implementation.
 * Self-contained: holds state internally via JS, notifies React subscribers
 * via useSyncExternalStore hooks without triggering parent component re-renders.
 */
export class NativeReactFormAdapter implements FormAdapter {
  private state: Record<string, any>;
  private errors: Record<string, any>;
  private setErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  private validators: Map<string, (value: any) => boolean | string>;
  private listeners: Set<(field: string, value: any) => void>;
  private _fieldSubscribers: Map<string, Set<() => void>> = new Map();
  private _globalSubscribers: Set<() => void> = new Set();
  private _version: number = 0;

  constructor(
    initialState: Record<string, any>,
    errors: Record<string, any> = {},
    setErrors: React.Dispatch<React.SetStateAction<Record<string, any>>> = () => {}
  ) {
    this.state = initialState;
    this.errors = errors;
    this.setErrors = setErrors;
    this.validators = new Map();
    this.listeners = new Set();
  }

  /**
   * Replace the entire form state (e.g. for reset or external hydration).
   * Updates internal state and notifies all global subscribers so that
   * useSyncExternalStore consumers re-render.
   */
  setValues(newState: Record<string, any>): void {
    this.state = newState;
    this._version++;
    this._globalSubscribers.forEach(cb => cb());
    // Also notify every field subscriber so individual fields update
    this._fieldSubscribers.forEach(subs => subs.forEach(cb => cb()));
  }

  /**
   * Update internal state reference (called when external state changes, e.g. initialValues prop update).
   * Does NOT notify subscribers — use setValues for that.
   */
  updateState(newState: Record<string, any>): void {
    this.state = newState;
  }

  /**
   * Update internal errors reference.
   */
  updateErrors(newErrors: Record<string, any>): void {
    this.errors = newErrors;
  }

  getValues(): Record<string, any> {
    return { ...this.state };
  }

  getValue(field: string): any {
    const parts = field.split('.');
    let value: any = this.state;
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    return value;
  }

  setValue(field: string, value: any): void {
    const parts = field.split('.');

    // Update internal state synchronously so getFieldSnapshot returns fresh data immediately
    const newState = { ...this.state };
    if (parts.length === 1) {
      newState[field] = value;
    } else {
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
    this.state = newState;
    this._version++;

    // Validate field if validator exists
    this.validateField(field, value);

    // Notify legacy listeners
    this.listeners.forEach(listener => listener(field, value));

    // Notify field-level subscribers (for useSyncExternalStore)
    const fieldSubs = this._fieldSubscribers.get(field);
    if (fieldSubs) {
      fieldSubs.forEach(cb => cb());
    }
    this._globalSubscribers.forEach(cb => cb());
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
        this.setValues(newValues);
      });
      return state;
    }
  }

  reset(values?: Record<string, any>): void {
    this.setValues(values || {});
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
    const newState = { ...this.state };
    delete newState[field];
    this.setValues(newState);
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

      onSubmit(this.getValues());
    };
  }

  private validateField(field: string, value: any): void {
    const validator = this.validators.get(field);
    if (validator) {
      const result = validator(value);
      if (result === true) {
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
   * Subscribe to field changes (legacy API)
   */
  subscribe(callback: (field: string, value: any) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to changes on a specific field (for useSyncExternalStore).
   */
  subscribeField(field: string, callback: () => void): () => void {
    let subs = this._fieldSubscribers.get(field);
    if (!subs) {
      subs = new Set();
      this._fieldSubscribers.set(field, subs);
    }
    subs.add(callback);
    return () => {
      subs!.delete(callback);
      if (subs!.size === 0) {
        this._fieldSubscribers.delete(field);
      }
    };
  }

  /**
   * Subscribe to any value change (for useSyncExternalStore on all values).
   */
  subscribeAll(callback: () => void): () => void {
    this._globalSubscribers.add(callback);
    return () => {
      this._globalSubscribers.delete(callback);
    };
  }

  /**
   * Get a snapshot of a field value (for useSyncExternalStore).
   */
  getFieldSnapshot(field: string): any {
    return this.getValue(field);
  }

  /**
   * Get a snapshot of all values (for useSyncExternalStore).
   */
  getValuesSnapshot(): Record<string, any> {
    return this.state;
  }

  /**
   * Get the current version (incremented on every setValue / setValues).
   */
  getVersion(): number {
    return this._version;
  }
}

/**
 * Create a self-contained native React form adapter.
 *
 * @example
 * ```tsx
 * const adapter = createNativeReactFormAdapter({ name: '' });
 * ```
 */
export function createNativeReactFormAdapter(
  initialState: Record<string, any>,
  errors?: Record<string, any>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, any>>>
): NativeReactFormAdapter {
  return new NativeReactFormAdapter(initialState, errors, setErrors);
}
