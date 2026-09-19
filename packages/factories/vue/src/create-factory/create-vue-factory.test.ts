import { createComponentSpec } from '@schepta/core';
import { createApp, defineComponent, h, ref, type PropType } from 'vue';
import { describe, expect, it } from 'vitest';
import { createVueFactory, type VueFactoryBaseProps } from './index';

interface TestFactoryProps extends VueFactoryBaseProps {
  schema: Record<string, any>;
  label?: string;
}

interface TestFactoryRef {
  getLabel: () => string;
}

const Root = defineComponent({
  setup(_props, { slots }) {
    return () => h('section', { 'data-testid': 'vue-root' }, slots.default?.());
  },
});

const Label = defineComponent({
  props: { text: { type: String, default: '' } },
  setup(props) {
    return () => h('span', { 'data-testid': 'vue-label' }, props.text);
  },
});

const TestFactory = createVueFactory<TestFactoryProps, TestFactoryRef>({
  name: 'TestFactory',
  schemaDefinition: { type: 'object' },
  rootComponentKey: 'Root',
  defaultComponents: {
    Root: createComponentSpec({ id: 'Root', type: 'container', component: () => Root }),
    Label: createComponentSpec({ id: 'Label', type: 'content', component: () => Label }),
  },
  propsDef: {
    schema: { type: Object as PropType<Record<string, any>>, required: true },
    label: { type: String, default: '' },
  },
  useSetup: ({ props }) => ({
    refApi: { getLabel: () => props.label ?? '' },
  }),
});

const schema = {
  type: 'object',
  'x-component': 'Root',
  properties: {
    label: {
      type: 'object',
      'x-component': 'Label',
      'x-component-props': { text: 'Hello Vue' },
    },
  },
};

describe('createVueFactory', () => {
  it('validates, renders the schema tree, and exposes the setup ref API', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const factoryRef = ref<TestFactoryRef | null>(null);

    createApp(() => h(TestFactory, { schema, label: 'factory label', ref: factoryRef })).mount(
      container
    );

    expect(container.querySelector('[data-testid="vue-root"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="vue-label"]')?.textContent).toBe('Hello Vue');
    expect(factoryRef.value?.getLabel()).toBe('factory label');
  });
});
