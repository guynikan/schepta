import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import { VueRuntimeAdapter } from './runtime-adapter';

describe('VueRuntimeAdapter.create', () => {
  it('passes component props through untouched', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VueRuntimeAdapter();
    const received: Record<string, any>[] = [];
    const Host = defineComponent({
      inheritAttrs: false,
      setup(_props, { attrs }) {
        return () => { received.push({ ...attrs }); return h('span', String(attrs['x-content'])); };
      },
    });
    const props = {
      'x-content': 'Title',
      'x-component-props': { variant: 'outlined', hint: 'help' },
      externalContext: { user: 'u' },
      schema: { type: 'string' },
      variant: 'outlined',
      density: 'compact',
      columns: '1fr 1fr',
    };

    const wrapper = mount({ render: () => adapter.create({ id: 'host', type: 'content', component: () => Host } as any, props) as VNode });

    expect(wrapper.text()).toBe('Title');
    expect(received[0]).toEqual(props);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('sanitizes props when the component is a native tag', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VueRuntimeAdapter();
    const create = (tagName: string, props: Record<string, any>) =>
      mount({ render: () => adapter.create({ id: 'native', type: 'content', component: () => tagName } as any, props) as VNode });

    const link = create('a', {
      href: 'mailto:alert(1)',
      protocol: 'javascript:',
      '.innerHTML': '<img src=x onerror=alert(1)>',
      '^onclick': 'alert(1)',
      title: 'Safe title',
      externalContext: { user: 'u' },
    });
    expect(link.html()).toBe('<a href="mailto:alert(1)" title="Safe title"></a>');

    const frame = create('iframe', { src: 'data:image/png;base64,iVBORw0KGgo=', srcdoc: '<script>alert(1)</script>' });
    expect(frame.html()).toBe('<iframe></iframe>');

    const image = create('img', { src: 'data:image/png;base64,iVBORw0KGgo=' });
    expect(image.attributes('src')).toBe('data:image/png;base64,iVBORw0KGgo=');

    const form = create('form', { action: 'https://attacker.example/steal' });
    expect(form.html()).toBe('<form></form>');
    warn.mockRestore();
  });
});
