import type { JsonValue, UiSpec } from './types';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sortValue(record[key]);
        return sorted;
      }, Object.create(null) as Record<string, unknown>);
  }

  return value;
}

/**
 * Return a deep-cloned spec with object keys sorted recursively.
 * Arrays retain their order because children, action order and slot order are
 * semantic. The input object is never mutated.
 */
export function canonicalizeUiSpec(spec: UiSpec): UiSpec {
  return sortValue(spec) as UiSpec;
}

/** Stable compact JSON representation suitable for hashes and cache keys. */
export function stringifyCanonicalUiSpec(spec: UiSpec): string {
  return JSON.stringify(canonicalizeUiSpec(spec));
}

/** Public helper for callers canonicalizing JSON fragments in a catalog. */
export function canonicalizeJsonValue(value: JsonValue): JsonValue {
  return sortValue(value) as JsonValue;
}
