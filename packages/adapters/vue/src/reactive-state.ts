/**
 * Vue Reactive State
 * 
 * Implements ReactiveState using Vue ref/reactive
 */

import { ref, watch, type Ref } from 'vue';
import type { ReactiveState } from '@spectra/core';

/**
 * Vue-based reactive state implementation
 */
export class VueReactiveState<T> implements ReactiveState<T> {
  private ref: Ref<T>;

  constructor(valueOrRef: T | Ref<T>) {
    if (valueOrRef && typeof valueOrRef === 'object' && 'value' in valueOrRef) {
      this.ref = valueOrRef as Ref<T>;
    } else {
      this.ref = ref(valueOrRef) as Ref<T>;
    }
  }

  get(): T {
    return this.ref.value;
  }

  get value(): T {
    return this.ref.value;
  }

  set(value: T): void {
    this.ref.value = value;
  }

  watch(callback: (value: T, oldValue: T) => void): () => void {
    const stop = watch(this.ref, (newValue, oldValue) => {
      callback(newValue, oldValue);
    });
    return stop;
  }
}

