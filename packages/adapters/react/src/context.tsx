/**
 * React Context Adapter
 * 
 * Implements Context using React Context API
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Context } from '@spectra/core';

/**
 * React-based context implementation
 */
export class ReactContext<T> implements Context<T> {
  private ReactContext: React.Context<T | null>;
  private defaultValue: T | null;

  constructor(defaultValue: T | null = null) {
    this.defaultValue = defaultValue;
    this.ReactContext = createContext<T | null>(defaultValue);
  }

  provide(value: T): void {
    // In React, providing is done via Provider component
    // This method exists for interface compatibility
  }

  consume(): T | null {
    const value = useContext(this.ReactContext);
    if (value === null && this.defaultValue === null) {
      throw new Error('Context value not provided');
    }
    return value ?? this.defaultValue;
  }

  tryConsume(): T | null {
    try {
      return this.consume();
    } catch {
      return null;
    }
  }

  get Provider(): React.Provider<T | null> {
    return this.ReactContext.Provider;
  }
}

/**
 * Create a React context
 */
export function createReactContext<T>(defaultValue: T | null = null): ReactContext<T> {
  return new ReactContext(defaultValue);
}

/**
 * Provider component props
 */
export interface SpectraProviderProps<T> {
  value: T;
  children: React.ReactNode;
}

/**
 * Create a provider component factory
 */
export function createProviderComponent<T>(
  context: ReactContext<T>
): React.FC<SpectraProviderProps<T>> {
  return ({ value, children }) => {
    return React.createElement(context.Provider, { value }, children);
  };
}

