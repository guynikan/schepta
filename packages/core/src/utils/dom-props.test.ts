import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('O1: allows harmless layout, paint and timing CSS functions', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const style = {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(auto-fit, minmax(100px, 1fr))',
      width: 'fit-content(20em)',
      transform: 'translate(1px, 2px) translateX(10px) translateY(1px) translateZ(0) translate3d(0, 0, 0) scale(1.1) scaleX(1) scaleY(1) scaleZ(1) scale3d(1, 1, 1) rotate(5deg) rotateX(1deg) rotateY(1deg) rotateZ(1deg) rotate3d(1, 1, 1, 5deg) skew(1deg) skewX(1deg) skewY(1deg) matrix(1, 0, 0, 1, 0, 0) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) perspective(100px)',
      background: 'linear-gradient(red, blue)',
      backgroundImage: 'radial-gradient(circle, red, blue), conic-gradient(red, blue), repeating-linear-gradient(red, blue 10px), repeating-radial-gradient(red, blue 10px), repeating-conic-gradient(red 0deg 10deg)',
      filter: 'blur(2px) brightness(1.1) contrast(1.2) drop-shadow(0 0 2px black) grayscale(1) hue-rotate(10deg) invert(1) opacity(0.5) saturate(2) sepia(1)',
      paddingTop: 'env(safe-area-inset-top)',
      color: 'oklch(70% 0.1 200)',
      borderColor: 'oklab(70% 0.1 0.1)',
      outlineColor: 'lab(50% 40 59)',
      caretColor: 'lch(50% 40 59)',
      backgroundColor: 'color-mix(in srgb, red 50%, blue)',
      transitionTimingFunction: 'cubic-bezier(0.1, 0.7, 1, 0.1)',
      animationTimingFunction: 'steps(4, end)',
    };
    expect(sanitizeDOMProps({ style })).toEqual({ style });
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it('O1: keeps resource-loading and document-reading CSS functions rejected', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const value of [
      'url(https://attacker.example/x.png)',
      'image-set("https://attacker.example/x.png" 1x)',
      'image("https://attacker.example/x.png")',
      'cross-fade(url(a), url(b))',
      'element(#id)',
      'paint(worklet)',
      'expression(alert(1))',
      'attr(data-x)',
      'linear-gradient(red, url(https://attacker.example/x.png))',
      'repeat(2, url(https://attacker.example/x.png))',
      'src(https://attacker.example/x.png)',
      'translateX(1px\\)',
      'tran\\73late(1px)',
    ]) {
      expect(sanitizeDOMProps({ style: { backgroundImage: value } })).toEqual({});
    }

    warn.mockRestore();
  });

  it('O1: allows parentheses inside quoted font-family strings only', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const fontFamily of ['"Font (Display)", serif', "'Font (Display)', serif", '"A (1)", \'B (2)\', sans-serif']) {
      expect(sanitizeDOMProps({ style: { fontFamily } })).toEqual({ style: { fontFamily } });
    }
    expect(sanitizeDOMProps({ style: { font: '12px "Font (Display)"' } })).toEqual({ style: { font: '12px "Font (Display)"' } });
    expect(warn).not.toHaveBeenCalled();

    for (const fontFamily of [
      '"Font" url(https://attacker.example/x.woff)',
      '"Font (Display)" url(https://attacker.example/x.woff) "x"',
      '"unterminated url(https://attacker.example/x.woff)',
      '"line\n" url(https://attacker.example/x.woff) "',
      '/* " */ url(https://attacker.example/x.woff) /* " */',
      '"Font \\28 Display\\29"',
    ]) {
      expect(sanitizeDOMProps({ style: { fontFamily } })).toEqual({});
    }
    // Quoted parentheses stay rejected outside font properties.
    expect(sanitizeDOMProps({ style: { content: '"url(x)"' } })).toEqual({});

    warn.mockRestore();
  });

  it('O1: drops only the offending style declaration', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(sanitizeDOMProps({
      style: {
        color: 'red',
        backgroundImage: 'url(https://attacker.example/x.png)',
        gridTemplateColumns: 'repeat(2, 1fr)',
        cssText: 'color: blue',
        margin: 0,
        padding: { top: 1 },
      },
      title: 'kept',
    })).toEqual({ style: { color: 'red', gridTemplateColumns: 'repeat(2, 1fr)', margin: 0 }, title: 'kept' });
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn.mock.calls.map(([message]) => message).join('\n')).toContain('backgroundImage');
    expect(sanitizeDOMProps({ style: {} })).toEqual({ style: {} });

    warn.mockRestore();
  });

  it('O3: does not throw for tag names that are Object.prototype members', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const png = 'data:image/png;base64,iVBORw0KGgo=';

    for (const tagName of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf', 'prototype']) {
      expect(() => sanitizeDOMProps({ src: png, srcset: `${png} 1x`, href: '/a', title: 'kept' }, tagName)).not.toThrow();
      expect(sanitizeDOMProps({ src: png, srcset: `${png} 1x`, href: '/a', title: 'kept' }, tagName)).toEqual({ href: '/a', title: 'kept' });
    }

    warn.mockRestore();
  });

  it('O5: allows the extra native props', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const props = {
      list: 'cities',
      spellCheck: false,
      wrap: 'soft',
      enterKeyHint: 'search',
      autoCapitalize: 'words',
      rel: 'nofollow',
      loading: 'lazy',
      open: true,
      draggable: true,
    };
    expect(sanitizeDOMProps(props, 'input')).toEqual(props);
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it('O5: restricts target to browsing context keywords and hardens _blank', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    for (const target of ['_self', '_parent', '_top']) {
      expect(sanitizeDOMProps({ target, href: '/a' }, 'a')).toEqual({ target, href: '/a' });
    }
    expect(warn).not.toHaveBeenCalled();

    expect(sanitizeDOMProps({ target: '_blank' }, 'a')).toEqual({ target: '_blank', rel: 'noopener noreferrer' });
    expect(sanitizeDOMProps({ target: '_BLANK', rel: 'nofollow' }, 'a')).toEqual({ target: '_BLANK', rel: 'nofollow noopener noreferrer' });
    expect(sanitizeDOMProps({ rel: 'NoOpener external', target: '_blank' }, 'a')).toEqual({ rel: 'NoOpener external noreferrer', target: '_blank' });
    expect(sanitizeDOMProps({ target: '_blank', rel: 'opener' }, 'a').rel).toBe('opener noopener noreferrer');
    // A rel that is dropped cannot weaken a _blank target.
    expect(sanitizeDOMProps({ target: '_blank', rel: ['opener'] }, 'a')).toEqual({ target: '_blank', rel: 'noopener noreferrer' });
    expect(sanitizeDOMProps({ '^target': '_blank', '.rel': 'opener' }, 'a')).toEqual({ target: '_blank', rel: 'opener noopener noreferrer' });

    for (const target of ['frame-name', 'javascript:alert(1)', '', '_new', ['_blank'], { toString: () => '_blank' }, 1]) {
      expect(sanitizeDOMProps({ target }, 'a')).toEqual({});
    }

    warn.mockRestore();
  });

  describe('O5: absolute form targets', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('allows absolute form targets only when they are same-origin with the document', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.stubGlobal('location', { origin: 'https://app.example', href: 'https://app.example/forms/edit' });

      for (const value of ['https://app.example/submit', 'HTTPS://APP.EXAMPLE/submit?a=1#b', '//app.example/submit', 'https://app.example:443/submit']) {
        expect(sanitizeDOMProps({ action: value }, 'form')).toEqual({ action: value });
        expect(sanitizeDOMProps({ formAction: value }, 'button')).toEqual({ formAction: value });
      }
      expect(warn).not.toHaveBeenCalled();

      for (const value of [
        'https://attacker.example/steal',
        'http://app.example/submit',
        'https://app.example:8443/submit',
        'https://app.example.attacker.example/submit',
        'https://app.example@attacker.example/submit',
        '//attacker.example/steal',
        '/\\attacker.example/steal',
        '\\\\attacker.example/steal',
        '/\t/attacker.example/steal',
        'https:\\\\attacker.example/steal',
        'javascript:alert(1)',
        'data:text/html,x',
        'mailto:security@app.example',
        'blob:https://app.example/1',
      ]) {
        expect(sanitizeDOMProps({ action: value }, 'form')).toEqual({});
        expect(sanitizeDOMProps({ formAction: value }, 'button')).toEqual({});
      }
      expect(sanitizeDOMProps({ action: '/submit' }, 'form')).toEqual({ action: '/submit' });

      warn.mockRestore();
    });

    it('rejects every absolute form target when the document origin is unknown or opaque', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      expect(sanitizeDOMProps({ action: 'https://app.example/submit' }, 'form')).toEqual({});
      for (const location of [{ origin: 'null', href: 'about:blank' }, { origin: 'file://', href: 'file:///index.html' }]) {
        vi.stubGlobal('location', location);
        expect(sanitizeDOMProps({ action: 'https://app.example/submit' }, 'form')).toEqual({});
        expect(sanitizeDOMProps({ action: 'file:///etc/passwd' }, 'form')).toEqual({});
      }

      warn.mockRestore();
    });
  });
});
