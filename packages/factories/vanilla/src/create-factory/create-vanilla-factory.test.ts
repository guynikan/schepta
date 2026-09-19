import { createComponentSpec } from '@schepta/core';
import { describe, expect, it } from 'vitest';
import { createVanillaFactory, type VanillaFactoryBaseOptions } from './index';

interface TestFactoryOptions extends VanillaFactoryBaseOptions {
  schema: Record<string, any>;
  label?: string;
}

interface TestFactoryApi {
  getLabel: () => string;
}

function appendChildren(element: HTMLElement, children?: any[]): HTMLElement {
  for (const child of children ?? []) {
    if (child?.element instanceof Node) element.appendChild(child.element);
  }
  return element;
}

const TestFactory = createVanillaFactory<TestFactoryOptions, TestFactoryApi>({
  schemaDefinition: { type: 'object' },
  rootComponentKey: 'Root',
  defaultComponents: {
    Root: createComponentSpec({
      id: 'Root',
      type: 'container',
      component: (props) => {
        const root = document.createElement('section');
        root.dataset.testid = 'vanilla-root';
        return appendChildren(root, props.children);
      },
    }),
    Label: createComponentSpec({
      id: 'Label',
      type: 'content',
      component: (props) => {
        const label = document.createElement('span');
        label.dataset.testid = 'vanilla-label';
        label.textContent = props.text;
        return label;
      },
    }),
  },
  setup: ({ options }) => ({
    api: { getLabel: () => options.label ?? '' },
    getState: () => ({}),
  }),
});

const schema = {
  type: 'object',
  'x-component': 'Root',
  properties: {
    label: {
      type: 'object',
      'x-component': 'Label',
      'x-component-props': { text: 'Hello Vanilla' },
    },
  },
};

describe('createVanillaFactory', () => {
  it('validates, mounts the schema tree, exposes the setup API, and destroys it', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = TestFactory({ schema, container, label: 'factory label' });

    expect(container.querySelector('[data-testid="vanilla-root"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="vanilla-label"]')?.textContent).toBe(
      'Hello Vanilla'
    );
    expect(instance.getLabel()).toBe('factory label');

    instance.destroy();
    expect(container.firstChild).toBeNull();
  });
});
