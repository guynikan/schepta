const URL_PROPERTIES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'srcset']);
const ALLOWED_PROPERTIES = new Set([
  'class', 'classname', 'id', 'name', 'type', 'value', 'defaultvalue',
  'checked', 'defaultchecked', 'disabled', 'readonly', 'required',
  'placeholder', 'title', 'role', 'tabindex', 'hidden', 'lang', 'dir',
  'min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'multiple',
  'rows', 'cols', 'autocomplete', 'autofocus', 'inputmode', 'htmlfor', 'for',
  'label', 'selected', 'size', 'accept', 'alt', 'width', 'height', 'colspan',
  'rowspan', 'style', ...URL_PROPERTIES,
]);
const COMPONENT_PROPERTIES = new Set(['label', 'options', 'description', 'columns']);
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

function getUnsafeStyleReason(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'styles must be plain objects';
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return 'styles must be plain objects';

  for (const [property, cssValue] of Object.entries(value)) {
    if (property.toLowerCase() === 'csstext' || !isPrimitive(cssValue)) return 'style values must be scalar values without cssText';
    if (/url\(|expression\(|javascript:/i.test(String(cssValue))) return 'unsafe CSS value is not allowed';
  }
  return null;
}

/** Returns a reason when a prop must not be passed to a native DOM element. */
export function getUnsafeDOMPropReason(name: string, value: unknown): string | null {
  const normalizedName = normalizePropName(name);
  if (!normalizedName) return 'prop name is not allowed';
  const lowerCaseName = normalizedName.toLowerCase();

  if (lowerCaseName.startsWith('on')) return typeof value === 'function' ? null : 'event handler props must be functions';
  if (lowerCaseName.startsWith('data-') || lowerCaseName.startsWith('aria-')) return null;
  if (!ALLOWED_PROPERTIES.has(lowerCaseName)) return 'prop is not in the native DOM allowlist';
  if (URL_PROPERTIES.has(lowerCaseName)) return getUnsafeUrlReason(lowerCaseName, value);
  if (lowerCaseName === 'style') return getUnsafeStyleReason(value);

  return null;
}

/**
 * Drops schema-controlled props that are not explicitly safe for a native DOM
 * element. Component-only props must be consumed before a spread reaches DOM.
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
    safeProps[normalizedName] = value;
  }

  return safeProps;
}

/**
 * Keeps documented default-component props while applying the native allowlist
 * to every prop that might otherwise be forwarded to DOM.
 */
export function sanitizeComponentProps(props: Record<string, any>): Record<string, any> {
  const safeProps: Record<string, any> = {};
  for (const [name, value] of Object.entries(props)) {
    const normalizedName = normalizePropName(name);
    if (normalizedName && COMPONENT_PROPERTIES.has(normalizedName.toLowerCase())) {
      safeProps[normalizedName] = value;
      continue;
    }
    const reason = getUnsafeDOMPropReason(name, value);
    if (reason || !normalizedName) {
      console.warn(`[Schepta] Dropped unsafe DOM prop "${name}": ${reason}.`);
      continue;
    }
    safeProps[normalizedName] = value;
  }
  return safeProps;
}
