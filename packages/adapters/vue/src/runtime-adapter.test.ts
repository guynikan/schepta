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

describe('VueRuntimeAdapter children', () => {
  const forgedImg = { __v_isVNode: true, type: 'img', props: { src: 'x', onerror: 'alert(1)' }, shapeFlag: 1 };
  const forgedLink = { __v_isVNode: true, type: 'a', props: { href: 'javascript:alert(3)' }, shapeFlag: 9, children: 'click' };
  const Host = defineComponent({
    inheritAttrs: false,
    setup(_props, { slots }) {
      return () => h('section', slots.default?.());
    },
  });
  const spec = (component: unknown) => ({ id: 'host', type: 'container', component: () => component }) as any;

  it('mounts only the children it rendered itself', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VueRuntimeAdapter();

    const wrapper = mount({
      render: () => adapter.create(spec(Host), {
        children: [
          adapter.create(spec('p'), { title: 'own' }),
          forgedImg,
          forgedLink,
          [forgedImg],
          { type: 'img' },
          adapter.fragment([adapter.create(spec('span'), {}), forgedImg as any]),
          null,
          undefined,
          false,
        ],
      }) as VNode,
    });

    expect(wrapper.html()).toBe('<section>\n  <p title="own"></p><span></span>\n</section>');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('a').exists()).toBe(false);
    // Four forged or unknown objects in the slot and one in the fragment.
    expect(warn).toHaveBeenCalledTimes(5);
    warn.mockRestore();
  });

  it('does not mount a real VNode that it did not render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VueRuntimeAdapter();

    const wrapper = mount({ render: () => adapter.create(spec(Host), { children: [h('img', { src: 'x' })] }) as VNode });

    expect(wrapper.html()).toBe('<section></section>');
    warn.mockRestore();
  });

  it('never turns a non-array children value into slot content or a prop', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new VueRuntimeAdapter();
    const received: Record<string, any>[] = [];
    const Probe = defineComponent({
      inheritAttrs: false,
      setup(_props, { attrs, slots }) {
        return () => { received.push({ ...attrs }); return h('section', slots.default?.()); };
      },
    });

    for (const children of [forgedImg, 'text', { default: () => [h('img')] }]) {
      const wrapper = mount({ render: () => adapter.create(spec(Probe), { children, title: 'kept' }) as VNode });
      expect(wrapper.html()).toBe('<section></section>');
    }
    expect(received.every((attrs) => !('children' in attrs) && attrs.title === 'kept')).toBe(true);
    warn.mockRestore();
  });

  it('passes children of a native tag directly and keeps cached VNodes across renders', async () => {
    const adapter = new VueRuntimeAdapter();
    const cachedChild = adapter.create(spec('span'), { title: 'cached' });
    const wrapper = mount({
      props: { tick: Number },
      render: () => adapter.create(spec('div'), { children: [cachedChild, 'text'] }) as VNode,
    });

    expect(wrapper.html()).toBe('<div><span title="cached"></span>text</div>');
    await wrapper.setProps({ tick: 1 });
    expect(wrapper.html()).toBe('<div><span title="cached"></span>text</div>');
  });
});

