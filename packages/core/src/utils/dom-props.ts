const HTML_PARSING_PROPERTIES = new Set([
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
]);

function normalizeUrl(value: string): string {
  return value.replace(/[\u0000-\u0020\u007f-\u009f\s\ufeff]+/g, '').toLowerCase();
}

/**
 * Returns a reason when a prop must not be passed to a DOM element.
 * Schema-controlled values are treated as untrusted by all runtime adapters.
 */
export function getUnsafeDOMPropReason(name: string, value: unknown): string | null {
  const normalizedName = name.toLowerCase();

  if (HTML_PARSING_PROPERTIES.has(normalizedName)) {
    return 'HTML parsing properties are not allowed';
  }

  if (normalizedName.startsWith('on') && typeof value !== 'function') {
    return 'event handler props must be functions';
  }

  if (URL_PROPERTIES.has(normalizedName) && typeof value === 'string') {
    const normalizedUrl = normalizeUrl(value);
    const scheme = normalizedUrl.match(/^([a-z][a-z0-9+.-]*):/)?.[1];

    if (scheme === 'data') {
      return normalizedUrl.startsWith('data:image/') ? null : 'only image data URLs are allowed';
    }

    if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme)) {
      return 'URL scheme is not allowed';
    }
  }

  return null;
}

/**
 * Drops unsafe DOM props and warns when a schema attempted to use one.
 */
export function sanitizeDOMProps(props: Record<string, any>): Record<string, any> {
  const safeProps: Record<string, any> = {};

  for (const [name, value] of Object.entries(props)) {
    const reason = getUnsafeDOMPropReason(name, value);
    if (reason) {
      console.warn(`[Schepta] Dropped unsafe DOM prop "${name}": ${reason}.`);
      continue;
    }
    safeProps[name] = value;
  }

  return safeProps;
}
