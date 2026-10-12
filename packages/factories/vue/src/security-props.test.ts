import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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
});
