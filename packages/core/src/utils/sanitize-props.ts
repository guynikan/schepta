/**
 * Props Sanitization
 * 
 * Removes internal Schepta props before passing to DOM components.
 */

/**
 * List of internal props that should NOT be passed to the DOM
 * These are Schepta-specific metadata props
 */
const INTERNAL_PROPS = [
  'name',
  'x-ui',
  'x-component-props',
  'x-content',
  'x-rules',
  'x-reactions',
  'x-slots',
  'externalContext',
  'onSubmit',
  'formAdapter',
  'debug',
] as const;

/**
 * Remove internal Schepta props before passing to DOM components
 * 
 * This prevents props like x-ui, externalContext from appearing
 * as [object Object] attributes in the rendered HTML.
 * 
 * @param props - Props to sanitize
 * @returns Props with internal Schepta props removed
 * 
 * @example
 * ```typescript
 * const props = { name: 'field', 'x-ui': { order: 1 }, externalContext: {...} };
 * const sanitized = sanitizePropsForDOM(props);
 * // sanitized = { name: 'field' }
 * ```
 */
export function sanitizePropsForDOM(props: Record<string, any>): Record<string, any> {
  const sanitized = { ...props };
  
  for (const key of INTERNAL_PROPS) {
    delete sanitized[key];
  }
  
  return sanitized;
}

/**
 * List of internal prop keys (exported for testing/extension)
 */
export const SCHEPTA_INTERNAL_PROPS = INTERNAL_PROPS;

