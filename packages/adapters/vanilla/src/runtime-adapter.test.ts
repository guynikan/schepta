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
});
