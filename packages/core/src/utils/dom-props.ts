const HTML_PARSING_PROPERTIES = new Set([
  'dangerouslysetinnerhtml',
  'innerhtml',
  'outerhtml',
  'srcdoc',
  'insertadjacenthtml',
]);

const URL_PROPERTIES = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'xlink:href',
  'xlinkhref',
  'data',
  'poster',
  'background',
  'srcset',
  'ping',
  'manifest',
  'codebase',
  'cite',
  'longdesc',
  'usemap',
]);

const NESTED_PROP_BAGS = new Set(['x-component-props', 'componentprops', 'attrs', 'domprops', 'props']);
const PROP_NAME = /^[A-Za-z][A-Za-z0-9:_-]*$/;

function normalizeUrl(value: string): string {
  return value.replace(/[\u0000-\u0020\u007f-\u009f\s\ufeff]+/g, '').toLowerCase();
}

function normalizePropName(name: string): string | null {
  // Vue uses leading `.` and `^` to force DOM props and attributes respectively.
  const normalized = name.replace(/^[.^]+/, '');
  if (!PROP_NAME.test(normalized)) return null;

  const lowerCaseName = normalized.toLowerCase();
  if (lowerCaseName === '__proto__' || lowerCaseName === 'constructor' || lowerCaseName === 'prototype') {
    return null;
  }

  return normalized;
}

function isPrimitive(value: unknown): boolean {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

function getUnsafeUrlReason(name: string, value: unknown): string | null {
  if (!isPrimitive(value)) return 'URL values must be primitive values';

  const valueAsString = String(value);
  const candidates = name === 'srcset'
    ? valueAsString.split(',').map((candidate) => candidate.trim().split(/\s+/, 1)[0]).filter(Boolean)
    : name === 'ping'
      ? valueAsString.trim().split(/\s+/).filter(Boolean)
      : [valueAsString];

  for (const candidate of candidates) {
    const normalizedUrl = normalizeUrl(candidate);
    const scheme = normalizedUrl.match(/^([a-z][a-z0-9+.-]*):/)?.[1];

    if (scheme === 'data') {
      if (!normalizedUrl.startsWith('data:image/')) return 'only image data URLs are allowed';
      continue;
    }

    if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme)) {
      return 'URL scheme is not allowed';
    }
  }

  return null;
}

/**
 * Returns a reason when a prop must not be passed to a DOM element.
 * Schema-controlled values are treated as untrusted by all runtime adapters.
 */
export function getUnsafeDOMPropReason(name: string, value: unknown): string | null {
  const normalizedName = normalizePropName(name);
  if (!normalizedName) return 'prop name is not allowed';
  const lowerCaseName = normalizedName.toLowerCase();

  if (HTML_PARSING_PROPERTIES.has(lowerCaseName)) {
    return 'HTML parsing properties are not allowed';
  }

  if (lowerCaseName.startsWith('on') && typeof value !== 'function') {
    return 'event handler props must be functions';
  }

  if (URL_PROPERTIES.has(lowerCaseName)) {
    return getUnsafeUrlReason(lowerCaseName, value);
  }

  if (lowerCaseName === 'style' && (typeof value === 'string' || (value && typeof value === 'object' && 'cssText' in value))) {
    return 'string styles and cssText are not allowed';
  }

  return null;
}

/**
 * Drops unsafe DOM props recursively and warns when a schema attempted to use one.
 */
export function sanitizeDOMProps(props: Record<string, any>): Record<string, any> {
  const safeProps: Record<string, any> = {};

  for (const [name, value] of Object.entries(props)) {
    const normalizedName = normalizePropName(name);
    const reason = getUnsafeDOMPropReason(name, value);
    if (reason || !normalizedName) {
      console.warn(`[Schepta] Dropped unsafe DOM prop "${name}": ${reason}.`);
      continue;
    }
    const lowerCaseName = normalizedName.toLowerCase();
    safeProps[normalizedName] = NESTED_PROP_BAGS.has(lowerCaseName) && value && typeof value === 'object' && !Array.isArray(value)
      ? sanitizeDOMProps(value)
      : value;
  }

  return safeProps;
}
