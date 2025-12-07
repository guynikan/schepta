/**
 * React Reactive State
 * 
 * Implements ReactiveState using React hooks
 */

import { useState, useEffect, useRef } from 'react';
import type { ReactiveState } from '@schepta/core';

/**
 * React-based reactive state implementation
 */
export class ReactReactiveState<T> implements ReactiveState<T> {
  private _value: T;
  private listeners: Set<(value: T, oldValue: T) => void> = new Set();
  private _setValue: (value: T) => void;

  constructor(initialValue: T, setValue?: (value: T) => void) {
    this._value = initialValue;
    this._setValue = setValue || (() => {});
  }

  get(): T {
    return this._value;
  }

  get value(): T {
    return this._value;
  }

  set(value: T): void {
    const oldValue = this._value;
    this._value = value;
    this._setValue(value);
    this.listeners.forEach(listener => listener(value, oldValue));
  }

  watch(callback: (value: T, oldValue: T) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

/**
 * Hook-based reactive state for React components
 */
export function useReactiveState<T>(initialValue: T): [ReactiveState<T>, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const stateRef = useRef<ReactReactiveState<T>>();

  if (!stateRef.current) {
    stateRef.current = new ReactReactiveState(value, setValue);
  }

  useEffect(() => {
    if (stateRef.current && stateRef.current.get() !== value) {
      stateRef.current.set(value);
    }
  }, [value]);

  return [stateRef.current, setValue];
}

