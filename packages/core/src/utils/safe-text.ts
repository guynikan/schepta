/**
 * Returns a schema value as text that is safe to place in child position or
 * in a text sink: a string as is, a finite number converted with `String`, and
 * an empty string for everything else (objects, arrays, booleans, null,
 * undefined, functions).
 *
 * Schema JSON is untrusted. A renderer may give meaning to an object in child
 * position: Vue mounts any object with `__v_isVNode: true` as a real element,
 * and JSON can forge one. Rendering only text closes that door.
 */
export function toSafeText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

/**
 * Returns a schema-controlled prop bag without its `children` key. Children are
 * only ever produced by the orchestrator from schema `properties`, so a
 * `children` value that comes from schema JSON must never be rendered.
 */
export function omitSchemaChildren<T>(props: T): T {
  if (!props || typeof props !== 'object' || Array.isArray(props) || !('children' in props)) return props;
  const { children, ...rest } = props as Record<string, any>;
  return rest as T;
}
