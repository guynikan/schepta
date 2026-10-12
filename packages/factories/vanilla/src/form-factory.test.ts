import { describe, expect, it, vi } from 'vitest';
import { createFormFactory } from './form-factory';

describe('createFormFactory validation errors', () => {
  it('renders schema-controlled validation errors as text', () => {
    const container = document.createElement('div');
    const errorText = '<img src=x onerror=alert(1)>';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    createFormFactory({
      container,
      schema: { [errorText]: true } as any,
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('pre')?.textContent).toContain(errorText);
    consoleError.mockRestore();
  });
});
