/**
 * Vue Context Adapter
 * 
 * Implements Context using Vue provide/inject
 */

import { provide, inject, type InjectionKey } from 'vue';
import type { Context } from '@spectra/core';

/**
 * Vue-based context implementation
 */
export class VueContext<T> implements Context<T> {
  private key: InjectionKey<T>;
  private defaultValue: T | null;

  constructor(key: string, defaultValue: T | null = null) {
    this.key = Symbol(key) as InjectionKey<T>;
    this.defaultValue = defaultValue;
  }

  provide(value: T): void {
    provide(this.key, value);
  }

  consume(): T | null {
    const value = inject(this.key, this.defaultValue);
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

  get injectionKey(): InjectionKey<T> {
    return this.key;
  }
}

/**
 * Create a Vue context
 */
export function createVueContext<T>(key: string, defaultValue: T | null = null): VueContext<T> {
  return new VueContext(key, defaultValue);
}

