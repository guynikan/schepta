const URL_PROPERTIES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'srcset']);
const FORM_TARGET_PROPERTIES = new Set(['action', 'formaction']);
const ALLOWED_PROPERTIES = new Set([
  'class', 'classname', 'id', 'name', 'type', 'value', 'defaultvalue',
  'checked', 'defaultchecked', 'disabled', 'readonly', 'required',
  'placeholder', 'title', 'role', 'tabindex', 'hidden', 'lang', 'dir',
  'min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'multiple',
  'rows', 'cols', 'autocomplete', 'autofocus', 'inputmode', 'htmlfor', 'for',
  'label', 'selected', 'size', 'accept', 'alt', 'width', 'height', 'colspan',
  'rowspan', 'style', ...URL_PROPERTIES,
]);
// Props that belong to the Schepta component contract. They are consumed by
// components and never belong on a native element, so they are dropped quietly.
const COMPONENT_CONTRACT_PROPERTIES = new Set([
  'x-content', 'x-component', 'x-component-props', 'x-ui', 'externalcontext',
  'schema', 'componentkey', 'columns', 'options', 'description', 'modelvalue',
]);
// Image-only sinks, keyed by tag name: a data URL there is rendered as an image
// and never as a document.
const IMAGE_SOURCE_PROPERTIES: Record<string, Set<string>> = {
  img: new Set(['src', 'srcset']),
  input: new Set(['src']),
  source: new Set(['srcset']),
  video: new Set(['poster']),
};
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpeg|gif|webp|avif)[;,]/;
const SAFE_CSS_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'calc', 'var', 'min', 'max', 'clamp']);
const PROP_NAME = /^[A-Za-z][A-Za-z0-9:_-]*$/;

function normalizeUrl(value: string): string {
  return value.replace(/[\u0000- \u007f-\u009f\s﻿]+/g, '').toLowerCase();
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

function getUnsafeUrlReason(name: string, value: unknown, tagName?: string): string | null {
  if (!isPrimitive(value)) return 'URL values must be primitive values';

  const valueAsString = String(value);
  const candidates = name === 'srcset'
    ? valueAsString.split(',').map((candidate) => candidate.trim().split(/\s+/, 1)[0]).filter(Boolean)
    : [valueAsString];
  // Without a known tag the prop could land on an iframe, embed or object, so
  // the strict rule applies.
  const isImageSource = tagName !== undefined
    && IMAGE_SOURCE_PROPERTIES[tagName.toLowerCase()]?.has(name) === true;

  for (const candidate of candidates) {
    const normalizedUrl = normalizeUrl(candidate);
    const scheme = normalizedUrl.match(/^([a-z][a-z0-9+.-]*):/)?.[1];

    if (FORM_TARGET_PROPERTIES.has(name)) {
      // Browsers read `\` as `/`, so `/\host` is as cross-origin as `//host`.
      if (scheme || normalizedUrl.startsWith('//') || normalizedUrl.includes('\\')) {
        return 'form targets must be same-origin relative URLs';
      }
      continue;
    }

    if (scheme === 'data') {
      if (!isImageSource) return 'data URLs are only allowed in image sources';
      if (!SAFE_IMAGE_DATA_URL.test(normalizedUrl)) return 'only raster image data URLs are allowed';
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
    const cssText = String(cssValue);
    // A backslash can spell any function name through CSS escapes (`\75rl(`).
    if (cssText.includes('\\') || /javascript:/i.test(cssText)) return 'unsafe CSS value is not allowed';
    for (const match of cssText.matchAll(/([A-Za-z0-9_-]*)\(/g)) {
      if (!SAFE_CSS_FUNCTIONS.has(match[1].toLowerCase())) return 'CSS function is not allowed';
    }
  }
  return null;
}

/**
 * Returns a reason when a prop must not be passed to a native DOM element.
 * `tagName` is the element the prop is applied to; leave it out when unknown
 * and the strictest URL rule is used.
 */
export function getUnsafeDOMPropReason(name: string, value: unknown, tagName?: string): string | null {
  const normalizedName = normalizePropName(name);
  if (!normalizedName) return 'prop name is not allowed';
  const lowerCaseName = normalizedName.toLowerCase();

  if (lowerCaseName.startsWith('on')) return typeof value === 'function' ? null : 'event handler props must be functions';
  if (lowerCaseName.startsWith('data-') || lowerCaseName.startsWith('aria-')) return null;
  if (!ALLOWED_PROPERTIES.has(lowerCaseName)) return 'prop is not in the native DOM allowlist';
  if (URL_PROPERTIES.has(lowerCaseName)) return getUnsafeUrlReason(lowerCaseName, value, tagName);
  if (lowerCaseName === 'style') return getUnsafeStyleReason(value);

  return null;
}

/**
 * Returns the subset of a schema-controlled prop bag that is safe to apply to a
 * native DOM element. Schema JSON is untrusted, so call this wherever such a
 * bag is spread onto a native element, passing the element's tag name.
 *
 * Props of the Schepta component contract (`x-content`, `externalContext`,
 * `schema`, ...) are dropped quietly; anything else that is dropped is reported
 * with `console.warn`.
 */
export function sanitizeDOMProps(props: Record<string, any>, tagName?: string): Record<string, any> {
  const safeProps: Record<string, any> = {};

  for (const [name, value] of Object.entries(props)) {
    // An undefined prop is a no-op for every renderer, so it is not worth a warning.
    if (value === undefined || COMPONENT_CONTRACT_PROPERTIES.has(name.toLowerCase())) continue;

    const normalizedName = normalizePropName(name);
    const reason = getUnsafeDOMPropReason(name, value, tagName);
    if (reason || !normalizedName) {
      console.warn(`[Schepta] Dropped unsafe DOM prop "${name}": ${reason}.`);
      continue;
    }
    safeProps[normalizedName] = value;
  }

  return safeProps;
}
