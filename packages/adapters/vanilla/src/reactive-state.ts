/**
 * Vanilla JS Reactive State
 * 
 * Implements ReactiveState using Proxy and EventEmitter
 */

import { EventEmitter } from './event-emitter';
import type { ReactiveState } from '@spectra/core';

/**
 * Vanilla JS-based reactive state implementation
 */
export class VanillaReactiveState<T> implements ReactiveState<T> {
  private _value: T;
  private emitter: EventEmitter;

  constructor(initialValue: T) {
    this._value = initialValue;
    this.emitter = new EventEmitter();
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
    this.emitter.emit('change', { value, oldValue });
  }

  watch(callback: (value: T, oldValue: T) => void): () => void {
    this.emitter.on('change', ({ value, oldValue }: any) => {
      callback(value, oldValue);
    });
    return () => {
      this.emitter.off('change', callback);
    };
  }
}

