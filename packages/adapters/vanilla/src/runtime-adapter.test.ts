import { describe, expect, it, vi } from 'vitest';
import { VanillaRuntimeAdapter } from './runtime-adapter';

describe('VanillaRuntimeAdapter.setProps', () => {
  it('drops unsafe schema props and applies legitimate props', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();
    const element = document.createElement('a');
    let clicked = false;

    adapter.setProps(element, {
      innerHTML: '<img src=x onerror=alert(1)>',
      onclick: 'alert(1)',
      href: ' JaVa\nScRiPt:alert(1)',
      className: 'safe-link',
      disabled: true,
      placeholder: 'Safe placeholder',
      'data-test-id': 'safe-link',
      onClick: () => { clicked = true; },
    });

    expect(element.innerHTML).toBe('');
    expect(element.getAttribute('onclick')).toBeNull();
    expect(element.getAttribute('href')).toBeNull();
    expect(element.className).toBe('safe-link');
    expect((element as HTMLAnchorElement & { disabled?: boolean }).disabled).toBe(true);
    expect((element as HTMLAnchorElement & { placeholder?: string }).placeholder).toBe('Safe placeholder');
    expect(element.dataset.testId).toBe('safe-link');
    element.click();
    expect(clicked).toBe(true);
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('href'));
    warn.mockRestore();
  });

  it('does not coerce array URL values into executable URLs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();
    const element = document.createElement('a');

    adapter.setProps(element, { href: ['javascript:alert(1)'] });

    expect(element.getAttribute('href')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('href'));
    warn.mockRestore();
  });

  it('does not allow URL decomposition properties to rewrite safe links', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();

    for (const tagName of ['a', 'area']) {
      const element = document.createElement(tagName);
      adapter.setProps(element, { href: 'mailto:alert(1)', protocol: 'javascript:' });
      expect(element.outerHTML).not.toContain('javascript:');
      expect(element.getAttribute('href')).toBe('mailto:alert(1)');
    }

    warn.mockRestore();
  });

  it('keeps arbitrary DOM properties from mutating markup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();

    for (const tagName of ['a', 'form', 'iframe', 'input', 'img']) {
      const element = document.createElement(tagName);
      const propertyNames: string[] = [];
      for (const key in element) propertyNames.push(key);

      for (const key of propertyNames) {
        adapter.setProps(element, { [key]: 'javascript:alert(1)' });
        adapter.setProps(element, { [key]: '<img src=x onerror=alert(1)>' });
      }

      expect(element.outerHTML).not.toContain('javascript:');
      expect(Array.from(element.attributes).some((attribute) => /^on/i.test(attribute.name))).toBe(false);
      expect(element.querySelector('img')).toBeNull();
    }

    warn.mockRestore();
  });

  it('passes component props through create() untouched', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();
    const received: Record<string, any>[] = [];
    const props = {
      'x-content': 'Title',
      'x-component-props': { variant: 'outlined', helperText: 'help' },
      externalContext: { user: 'u' },
      schema: { type: 'string' },
      variant: 'outlined',
      columns: '1fr 1fr',
    };

    adapter.create({
      id: 'host', type: 'content',
      component: () => (componentProps: Record<string, any>) => {
        received.push(componentProps);
        return document.createElement('div');
      },
    } as any, props);

    expect(received[0]).toBe(props);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('applies the tag-aware data URL, style and form-target rules', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VanillaRuntimeAdapter();
    const svg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(origin)"/>';
    const png = 'data:image/png;base64,iVBORw0KGgo=';

    for (const tagName of ['iframe', 'embed', 'img', 'input']) {
      const element = document.createElement(tagName);
      adapter.setProps(element, { src: svg });
      expect(element.getAttribute('src')).toBeNull();
    }
    for (const tagName of ['iframe', 'embed']) {
      const element = document.createElement(tagName);
      adapter.setProps(element, { src: png });
      expect(element.getAttribute('src')).toBeNull();
    }
    const image = document.createElement('img');
    adapter.setProps(image, { src: png });
    expect(image.getAttribute('src')).toBe(png);

    for (const backgroundImage of [
      'url(https://attacker.example/x.png)',
      'image-set("https://attacker.example/x.png" 1x)',
      '\\75rl(https://attacker.example/y.png)',
    ]) {
      const element = document.createElement('div');
      adapter.setProps(element, { style: { backgroundImage, color: 'red' } });
      expect(element.getAttribute('style')).toBeNull();
    }

    const form = document.createElement('form');
    adapter.setProps(form, { action: 'https://attacker.example/steal' });
    expect(form.getAttribute('action')).toBeNull();
    adapter.setProps(form, { action: '/submit' });
    expect(form.getAttribute('action')).toBe('/submit');

    const button = document.createElement('button');
    adapter.setProps(button, { type: 'submit', formAction: '//attacker.example/steal' });
    expect(button.getAttribute('formaction')).toBeNull();
    warn.mockRestore();
  });
});
