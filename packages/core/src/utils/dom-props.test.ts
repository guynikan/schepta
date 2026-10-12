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
      action: '/submit',
      formAction: 'save?draft=1',
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
      action: '/submit',
      formAction: 'save?draft=1',
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

  it('passes the Schepta component contract through no DOM prop and without warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(sanitizeDOMProps({
      'x-content': 'Title',
      'x-component-props': { variant: 'outlined' },
      'x-ui': { order: 1 },
      externalContext: { user: 'u' },
      schema: { type: 'string' },
      componentKey: 'InputText',
      columns: '1fr 1fr',
      options: [{ value: 'a', label: 'A' }],
      title: 'kept',
    }, 'div')).toEqual({ title: 'kept' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('S1: rejects data URLs outside raster image sources', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const svg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(origin)"/>';
    const png = 'data:image/png;base64,iVBORw0KGgo=';

    for (const tagName of ['iframe', 'embed', 'object', 'a', 'script', 'audio', 'video', 'source', undefined]) {
      expect(sanitizeDOMProps({ src: svg }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ src: png }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ href: png }, tagName)).toEqual({});
    }
    for (const tagName of ['img', 'IMG', 'input']) {
      expect(sanitizeDOMProps({ src: svg }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ src: ' DATA:image/SVG+xml;base64,AAAA' }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ src: 'data:image/pngx,AAAA' }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ src: 'data:text/html,<script>alert(1)</script>' }, tagName)).toEqual({});
      expect(sanitizeDOMProps({ src: png }, tagName)).toEqual({ src: png });
    }
    for (const type of ['png', 'jpeg', 'gif', 'webp', 'avif']) {
      const url = `data:image/${type};base64,AAAA`;
      expect(sanitizeDOMProps({ src: url }, 'img')).toEqual({ src: url });
    }
    expect(sanitizeDOMProps({ srcset: `${png} 1x, ${svg} 2x` }, 'img')).toEqual({});
    expect(sanitizeDOMProps({ srcset: `${png} 1x` }, 'img')).toEqual({ srcset: `${png} 1x` });
    expect(sanitizeDOMProps({ poster: png }, 'video')).toEqual({ poster: png });
    expect(sanitizeDOMProps({ data: png }, 'object')).toEqual({});

    warn.mockRestore();
  });

  it('S2: rejects CSS functions outside the allowlist and CSS escapes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const backgroundImage of [
      'url(https://attacker.example/x.png)',
      'URL(https://attacker.example/x.png)',
      'image-set("https://attacker.example/x.png" 1x)',
      '-webkit-image-set("https://attacker.example/x.png" 1x)',
      '\\75rl(https://attacker.example/y.png)',
      'u\\72l(https://attacker.example/y.png)',
      'expression(alert(1))',
      'var(--x, url(https://attacker.example/x.png))',
      'calc(1px) url(https://attacker.example/x.png)',
      'url/**/(https://attacker.example/x.png)',
      'cross-fade(url(a), url(b))',
      'element(#id)',
      'paint(worklet)',
      '(',
    ]) {
      expect(sanitizeDOMProps({ style: { backgroundImage } })).toEqual({});
    }

    const style = {
      color: 'rgb(1, 2, 3)',
      backgroundColor: 'rgba(1, 2, 3, 0.5)',
      borderColor: 'hsl(120 50% 50%)',
      outlineColor: 'hsla(120, 50%, 50%, 0.5)',
      width: 'calc(100% - var(--gap, 8px))',
      height: 'min(10px, 2vh)',
      maxWidth: 'max(10px, 2vw)',
      fontSize: 'clamp(12px, 2vw, 20px)',
      margin: 0,
      padding: '4px 8px',
    };
    expect(sanitizeDOMProps({ style })).toEqual({ style });

    warn.mockRestore();
  });

  it('S3: only allows same-origin relative form targets', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const name of ['action', 'formAction', 'formaction', '^formaction', '.action']) {
      for (const value of [
        'https://attacker.example/steal',
        'HTTP://attacker.example/steal',
        '//attacker.example/steal',
        ' //attacker.example/steal',
        '/\\attacker.example/steal',
        '\\\\attacker.example/steal',
        '/\t/attacker.example/steal',
        'mailto:security@example.com',
        'tel:+5511999999999',
        'javascript:alert(1)',
        'data:text/html,x',
        ['/submit'],
      ]) {
        expect(sanitizeDOMProps({ [name]: value }, 'form')).toEqual({});
        expect(sanitizeDOMProps({ [name]: value })).toEqual({});
      }
    }
    for (const value of ['/submit', 'submit', './submit', '../submit?a=b:c#d', '?step=2', '#top', '']) {
      expect(sanitizeDOMProps({ action: value }, 'form')).toEqual({ action: value });
      expect(sanitizeDOMProps({ formAction: value }, 'button')).toEqual({ formAction: value });
    }

    warn.mockRestore();
  });
});
