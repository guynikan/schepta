const URL_PROPERTIES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'srcset']);
const FORM_TARGET_PROPERTIES = new Set(['action', 'formaction']);
const ALLOWED_PROPERTIES = new Set([
  'class', 'classname', 'id', 'name', 'type', 'value', 'defaultvalue',
  'checked', 'defaultchecked', 'disabled', 'readonly', 'required',
  'placeholder', 'title', 'role', 'tabindex', 'hidden', 'lang', 'dir',
  'min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'multiple',
  'rows', 'cols', 'autocomplete', 'autofocus', 'inputmode', 'htmlfor', 'for',
  'label', 'selected', 'size', 'accept', 'alt', 'width', 'height', 'colspan',
  'rowspan', 'style', 'list', 'spellcheck', 'wrap', 'enterkeyhint',
  'autocapitalize', 'rel', 'loading', 'open', 'draggable', 'target',
  ...URL_PROPERTIES,
]);
const BROWSING_CONTEXT_KEYWORDS = new Set(['_self', '_blank', '_parent', '_top']);
const BLANK_TARGET_REL_TOKENS = ['noopener', 'noreferrer'];
// Props that belong to the Schepta component contract. They are consumed by
// components and never belong on a native element, so they are dropped quietly.
const COMPONENT_CONTRACT_PROPERTIES = new Set([
  'x-content', 'x-component', 'x-component-props', 'x-ui', 'externalcontext',
  'schema', 'componentkey', 'columns', 'options', 'description', 'modelvalue',
]);
// Image-only sinks, keyed by tag name: a data URL there is rendered as an image
// and never as a document. A Map, so a tag name such as `constructor` or
// `__proto__` finds nothing instead of an inherited object member.
const IMAGE_SOURCE_PROPERTIES = new Map<string, Set<string>>([
  ['img', new Set(['src', 'srcset'])],
  ['input', new Set(['src'])],
  ['source', new Set(['srcset'])],
  ['video', new Set(['poster'])],
]);
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpeg|gif|webp|avif)[;,]/;
// Layout, paint and timing functions that never load a resource. Anything that
// can (`url`, `image-set`, `image`, `cross-fade`, `element`, `paint`) or that
// reads the document (`attr`, `expression`) stays out.
const SAFE_CSS_FUNCTIONS = new Set([
  'rgb', 'rgba', 'hsl', 'hsla', 'calc', 'var', 'min', 'max', 'clamp',
  'repeat', 'minmax', 'fit-content',
  'translate', 'translatex', 'translatey', 'translatez', 'translate3d',
  'scale', 'scalex', 'scaley', 'scalez', 'scale3d',
  'rotate', 'rotatex', 'rotatey', 'rotatez', 'rotate3d',
  'skew', 'skewx', 'skewy', 'matrix', 'matrix3d', 'perspective',
  'linear-gradient', 'radial-gradient', 'conic-gradient',
  'repeating-linear-gradient', 'repeating-radial-gradient', 'repeating-conic-gradient',
  'blur', 'brightness', 'contrast', 'drop-shadow', 'grayscale', 'hue-rotate',
  'invert', 'opacity', 'saturate', 'sepia',
  'env', 'oklch', 'oklab', 'lab', 'lch', 'color-mix', 'cubic-bezier', 'steps',
]);
// Font names are the only place where a quoted string with parentheses is
// expected (`"Font (Display)", serif`).
const QUOTED_FONT_PROPERTIES = new Set(['fontfamily', 'font-family', 'font']);
const CSS_QUOTED_STRING = /"[^"]*"|'[^']*'/g;
// A comment can hide a quote and a line break ends a string early, in both
// cases for the CSS parser but not for the scan below.
const CSS_STRING_BREAKER = /\/\*|[\n\r\f]/;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * True when an absolute URL resolves to the origin of the current document.
 * Without a document (server-side rendering) the origin is unknown and every
 * absolute URL is treated as cross-origin.
 */
function isSameOriginUrl(value: string): boolean {
  const origin = typeof location === 'undefined' ? undefined : location.origin;
  if (typeof origin !== 'string' || !/^https?:\/\//.test(origin)) return false;

  try {
    // The URL parser applies the same rules as the browser (backslashes,
    // stripped tabs and line breaks, scheme-relative forms).
    const url = new URL(value, location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === origin;
  } catch {
    return false;
  }
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
    && IMAGE_SOURCE_PROPERTIES.get(tagName.toLowerCase())?.has(name) === true;

  for (const candidate of candidates) {
    const normalizedUrl = normalizeUrl(candidate);
    const scheme = normalizedUrl.match(/^([a-z][a-z0-9+.-]*):/)?.[1];

    if (FORM_TARGET_PROPERTIES.has(name)) {
      // Browsers read `\` as `/`, so `/\host` is as cross-origin as `//host`.
      const isAbsolute = Boolean(scheme) || normalizedUrl.startsWith('//') || normalizedUrl.includes('\\');
      if (isAbsolute && !isSameOriginUrl(candidate)) {
        return 'form targets must be same-origin URLs';
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

function getUnsafeStyleDeclarationReason(property: string, cssValue: unknown): string | null {
  if (property.toLowerCase() === 'csstext' || !isPrimitive(cssValue)) return 'style values must be scalar values without cssText';
  const cssText = String(cssValue);
  // A backslash can spell any function name through CSS escapes (`\75rl(`).
  if (cssText.includes('\\') || /javascript:/i.test(cssText)) return 'unsafe CSS value is not allowed';
  const scannedText = QUOTED_FONT_PROPERTIES.has(property.toLowerCase()) && !CSS_STRING_BREAKER.test(cssText)
    ? cssText.replace(CSS_QUOTED_STRING, '""')
    : cssText;
  for (const match of scannedText.matchAll(/([A-Za-z0-9_-]*)\(/g)) {
    if (!SAFE_CSS_FUNCTIONS.has(match[1].toLowerCase())) return 'CSS function is not allowed';
  }
  return null;
}

function getUnsafeStyleReason(value: unknown): string | null {
  if (!isPlainObject(value)) return 'styles must be plain objects';

  for (const [property, cssValue] of Object.entries(value)) {
    const reason = getUnsafeStyleDeclarationReason(property, cssValue);
    if (reason) return reason;
  }
  return null;
}

/**
 * Returns the safe declarations of a style object. Only the offending
 * declarations are dropped (and reported), so one bad value does not cost the
 * rest of the style. `undefined` means no safe declaration is left.
 */
function sanitizeStyle(value: Record<string, unknown>): Record<string, unknown> | undefined {
  const entries = Object.entries(value);
  const safeStyle: Record<string, unknown> = {};

  for (const [property, cssValue] of entries) {
    const reason = getUnsafeStyleDeclarationReason(property, cssValue);
    if (reason) {
      console.warn(`[Schepta] Dropped unsafe style declaration "${property}": ${reason}.`);
      continue;
    }
    safeStyle[property] = cssValue;
  }

  return entries.length > 0 && Object.keys(safeStyle).length === 0 ? undefined : safeStyle;
}

function getUnsafeTargetReason(value: unknown): string | null {
  return typeof value === 'string' && BROWSING_CONTEXT_KEYWORDS.has(value.toLowerCase())
    ? null
    : 'target must be _self, _blank, _parent or _top';
}

/**
 * A `_blank` target hands the opened page a reference to this one unless `rel`
 * says otherwise, so `noopener noreferrer` is always part of `rel` there.
 */
function enforceBlankTargetRel(safeProps: Record<string, any>): void {
  const names = Object.keys(safeProps);
  const targetName = names.find((name) => name.toLowerCase() === 'target');
  if (!targetName || String(safeProps[targetName]).toLowerCase() !== '_blank') return;

  const relName = names.find((name) => name.toLowerCase() === 'rel') ?? 'rel';
  const tokens = String(safeProps[relName] ?? '').split(/\s+/).filter(Boolean);
  for (const token of BLANK_TARGET_REL_TOKENS) {
    if (!tokens.some((existing) => existing.toLowerCase() === token)) tokens.push(token);
  }
  safeProps[relName] = tokens.join(' ');
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
  if (lowerCaseName === 'target') return getUnsafeTargetReason(value);
  if (lowerCaseName === 'rel') return typeof value === 'string' ? null : 'rel must be a string';

  return null;
}

/**
 * Returns the subset of a schema-controlled prop bag that is safe to apply to a
 * native DOM element. Schema JSON is untrusted, so call this wherever such a
 * bag is spread onto a native element, passing the element's tag name.
 *
 * Props of the Schepta component contract (`x-content`, `externalContext`,
 * `schema`, ...) are dropped quietly; anything else that is dropped is reported
 * with `console.warn`. An unsafe `style` declaration costs only that
 * declaration, and a `_blank` target always gets `rel="noopener noreferrer"`.
 */
export function sanitizeDOMProps(props: Record<string, any>, tagName?: string): Record<string, any> {
  const safeProps: Record<string, any> = {};

  for (const [name, value] of Object.entries(props)) {
    // An undefined prop is a no-op for every renderer, so it is not worth a warning.
    if (value === undefined || COMPONENT_CONTRACT_PROPERTIES.has(name.toLowerCase())) continue;

    const normalizedName = normalizePropName(name);
    if (normalizedName?.toLowerCase() === 'style' && isPlainObject(value)) {
      const safeStyle = sanitizeStyle(value);
      if (safeStyle) safeProps[normalizedName] = safeStyle;
      continue;
    }

    const reason = getUnsafeDOMPropReason(name, value, tagName);
    if (reason || !normalizedName) {
      console.warn(`[Schepta] Dropped unsafe DOM prop "${name}": ${reason}.`);
      continue;
    }
    safeProps[normalizedName] = value;
  }

  enforceBlankTargetRel(safeProps);
  return safeProps;
}
