import { describe, expect, it, vi } from 'vitest';
import { sanitizeDOMProps } from './dom-props';

describe('sanitizeDOMProps', () => {
  it('drops HTML parsing properties and string event handlers', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const props = sanitizeDOMProps({
      innerHTML: '<img src=x onerror=alert(1)>',
      outerHTML: '<div>',
      srcdoc: '<script>alert(1)</script>',
      onclick: 'alert(1)',
      onClick: () => undefined,
    });

    expect(props).toEqual({ onClick: expect.any(Function) });
    expect(warn).toHaveBeenCalledTimes(4);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('innerHTML'));
    warn.mockRestore();
  });

  it('allows safe DOM props and URL values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const props = sanitizeDOMProps({
      href: '/account',
      src: 'HTTPS://example.com/image.png',
      action: 'mailto:security@example.com',
      formAction: 'tel:+5511999999999',
      className: 'button',
      style: { color: 'rebeccapurple' },
      'data-test-id': 'submit',
      'aria-label': 'Submit form',
      value: 'value',
      checked: true,
      disabled: true,
      placeholder: 'Type here',
    });

    expect(props).toEqual(expect.objectContaining({
      href: '/account',
      src: 'HTTPS://example.com/image.png',
      action: 'mailto:security@example.com',
      formAction: 'tel:+5511999999999',
      className: 'button',
      style: { color: 'rebeccapurple' },
      'data-test-id': 'submit',
      'aria-label': 'Submit form',
      value: 'value',
      checked: true,
      disabled: true,
      placeholder: 'Type here',
    }));

    warn.mockRestore();
  });

  it('blocks case and whitespace-obfuscated unsafe URL schemes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const value of [
      'JaVaScRiPt:alert(1)',
      ' javascript:alert(1)',
      'java\tscript:alert(1)',
      'java\nscript:alert(1)',
      'vbscript:msgbox(1)',
      'data:text/html,<script>alert(1)</script>',
    ]) {
      expect(sanitizeDOMProps({ href: value })).toEqual({});
    }

    expect(sanitizeDOMProps({ src: 'data:text/html,<script>alert(1)</script>' })).toEqual({});
    warn.mockRestore();
  });

  it('normalizes Vue modifiers and drops props outside the allowlist', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(sanitizeDOMProps({
      dangerouslySetInnerHTML: { __html: '<img src=x onerror=alert(1)>' },
      '.innerHTML': '<img src=x onerror=alert(1)>',
      '^onclick': 'alert(1)',
      'x-component-props': {
        'x-component-props': { type: 'submit', formAction: 'javascript:alert(1)' },
      },
    })).toEqual({});

    warn.mockRestore();
  });

  it('rejects non-primitive URLs and unsafe URL-bearing attributes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const name of ['href', 'data', 'poster', 'background', 'srcset', 'ping', 'manifest', 'codebase', 'cite', 'longdesc', 'usemap', 'xlink:href']) {
      expect(sanitizeDOMProps({ [name]: ['javascript:alert(1)'] })).toEqual({});
    }
    expect(sanitizeDOMProps({ srcset: 'https://example.com/a.png 1x, javascript:alert(1) 2x' })).toEqual({});
    expect(sanitizeDOMProps({ style: 'color: red' })).toEqual({});
    expect(sanitizeDOMProps({ style: ['color: red'] })).toEqual({});
    expect(sanitizeDOMProps({ style: { cssText: 'color: red' } })).toEqual({});
    expect(sanitizeDOMProps({ style: { backgroundImage: 'url(javascript:alert(1))' } })).toEqual({});

    warn.mockRestore();
  });
});
