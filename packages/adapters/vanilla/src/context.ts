/**
 * Vanilla JS Context Adapter
 * 
 * Implements Context using Map/WeakMap
 */

import type { Context } from '@schepta/core';

/**
 * Context storage
 */
const contextStorage = new Map<string, any>();

/**
 * Vanilla JS-based context implementation
 */
export class VanillaContext<T> implements Context<T> {
  private key: string;
  private defaultValue: T | null;

  constructor(key: string, defaultValue: T | null = null) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  provide(value: T): void {
    contextStorage.set(this.key, value);
  }

  consume(): T | null {
    const value = contextStorage.get(this.key);
    if (value === undefined && this.defaultValue === null) {
      throw new Error(`Context value not provided for key: ${this.key}`);
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
}

/**
 * Create a Vanilla JS context
 */
export function createVanillaContext<T>(key: string, defaultValue: T | null = null): VanillaContext<T> {
  return new VanillaContext(key, defaultValue);
}

