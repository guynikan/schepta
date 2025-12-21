/**
 * Debug Utilities
 * 
 * Factory functions for creating debug configuration objects.
 */

import type { DebugContextValue } from '@schepta/core';

/**
 * Create a debug context configuration
 * 
 * @param enabled - Whether debug mode is enabled
 * @returns DebugContextValue if enabled, undefined otherwise
 */
export function createDebugContext(enabled: boolean): DebugContextValue | undefined {
  if (!enabled) {
    return undefined;
  }

  return {
    isEnabled: true,
    log: (category: string, message: string, data?: any) => {
      console.log(`[${category}]`, message, data);
    },
    buffer: {
      add: () => {},
      clear: () => {},
      getAll: () => [],
    },
  };
}

