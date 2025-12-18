/**
 * Template Detector
 * 
 * Framework-agnostic detection of template expressions {{ }}
 * Designed to be decoupled for future use with other parsers (e.g., JEXL)
 */

/**
 * Regular expression to match template expressions {{ ... }}
 * Matches: {{ $externalContext.user.name }}, {{ $formState.field }}, etc.
 */
const TEMPLATE_REGEX = /\{\{\s*([^}]+)\s*\}\}/g;

/**
 * Detect all template expressions in a string
 * 
 * @param str String to search for templates
 * @returns Array of matched expressions (without {{ }})
 * 
 * @example
 * detectTemplateExpressions("Hello {{ $externalContext.user.name }}")
 * // Returns: ["$externalContext.user.name"]
 */
export function detectTemplateExpressions(str: string): string[] {
  if (typeof str !== 'string') {
    return [];
  }

  const matches: string[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex to ensure fresh search
  TEMPLATE_REGEX.lastIndex = 0;

  while ((match = TEMPLATE_REGEX.exec(str)) !== null) {
    const expression = match[1].trim();
    if (expression) {
      matches.push(expression);
    }
  }

  return matches;
}

/**
 * Extract expression content from template syntax
 * Removes {{ }} and trims whitespace
 * 
 * @param template Template string like "{{ $externalContext.user.name }}"
 * @returns Extracted expression like "$externalContext.user.name"
 * 
 * @example
 * extractExpression("{{ $externalContext.user.name }}")
 * // Returns: "$externalContext.user.name"
 */
export function extractExpression(template: string): string {
  const match = template.match(/\{\{\s*([^}]+)\s*\}\}/);
  return match ? match[1].trim() : template;
}

/**
 * Check if a value contains template expressions (recursive)
 * 
 * @param value Value to check (can be string, object, array, etc.)
 * @returns true if value contains any template expressions
 * 
 * @example
 * hasTemplateExpressions("{{ $externalContext.user.name }}") // true
 * hasTemplateExpressions({ label: "{{ $formState.field }}" }) // true
 * hasTemplateExpressions(["{{ $externalContext.api }}", "static"]) // true
 * hasTemplateExpressions("static text") // false
 */
export function hasTemplateExpressions(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  // Check strings directly
  if (typeof value === 'string') {
    // Reset regex lastIndex to ensure fresh search
    TEMPLATE_REGEX.lastIndex = 0;
    return TEMPLATE_REGEX.test(value);
  }

  // Check arrays recursively
  if (Array.isArray(value)) {
    return value.some(item => hasTemplateExpressions(item));
  }

  // Check objects recursively
  if (typeof value === 'object') {
    return Object.values(value).some(val => hasTemplateExpressions(val));
  }

  return false;
}

/**
 * Get all template expressions from a value (recursive)
 * 
 * @param value Value to extract templates from
 * @returns Array of all unique template expressions found
 * 
 * @example
 * getAllTemplateExpressions({
 *   label: "{{ $externalContext.user.name }}",
 *   placeholder: "Enter {{ $externalContext.fieldName }}"
 * })
 * // Returns: ["$externalContext.user.name", "$externalContext.fieldName"]
 */
export function getAllTemplateExpressions(value: any): string[] {
  const expressions = new Set<string>();

  function collect(value: any): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      const found = detectTemplateExpressions(value);
      found.forEach(expr => expressions.add(expr));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => collect(item));
      return;
    }

    if (typeof value === 'object') {
      Object.values(value).forEach(val => collect(val));
    }
  }

  collect(value);
  return Array.from(expressions);
}

