/**
 * Vue Provider Tests
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { createScheptaProvider, useScheptaContext, useSchepta } from './provider';
import { createComponentSpec } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';

describe('Vue Provider', () => {
  it('should provide context to children', () => {
    const Provider = createScheptaProvider();
    const TestComponent = {
      setup() {
        const context = useScheptaContext();
        return () => h('div', { 'data-testid': 'context' }, context ? 'has-context' : 'no-context');
      },
    };

    const wrapper = mount(Provider, {
      slots: {
        default: () => h(TestComponent),
      },
    });

    expect(wrapper.find('[data-testid="context"]').text()).toBe('has-context');
  });

  it('should provide components configuration', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      component: () => null,
      type: 'field',
    });

    const Provider = createScheptaProvider({
      components: { TestComponent: componentSpec },
    });

    const ComponentConsumer = {
      setup() {
        const context = useSchepta();
        const hasComponent = context.components.TestComponent !== undefined;
        const isCorrectComponent = context.components.TestComponent === componentSpec;
        return () => h('div', { 'data-testid': 'component' }, hasComponent && isCorrectComponent ? 'has-component' : 'no-component');
      },
    };

    const wrapper = mount(Provider, {
      slots: {
        default: () => h(ComponentConsumer),
      },
    });

    expect(wrapper.find('[data-testid="component"]').text()).toBe('has-component');
  });

  it('should support nested providers with hierarchical merge', () => {
    const ParentComponent = createComponentSpec({
      id: 'ParentComponent',
      component: () => null,
      type: 'field',
    });

    const ChildComponent = createComponentSpec({
      id: 'ChildComponent',
      component: () => null,
      type: 'field',
    });

    const ParentProvider = createScheptaProvider({
      components: { ParentComponent },
    });

    const ChildProvider = createScheptaProvider({
      components: { ChildComponent },
    });

    const NestedConsumer = {
      setup() {
        const context = useSchepta();
        const hasParent = context.components.ParentComponent !== undefined;
        const hasChild = context.components.ChildComponent !== undefined;
        return () => h('div', { 'data-testid': 'nested' }, hasParent && hasChild ? 'both' : 'missing');
      },
    };

    const wrapper = mount(ParentProvider, {
      slots: {
        default: () => h(ChildProvider, {}, {
          default: () => h(NestedConsumer),
        }),
      },
    });

    expect(wrapper.find('[data-testid="nested"]').text()).toBe('both');
  });

  it('should merge middlewares hierarchically', () => {
    const globalMiddleware: MiddlewareFn = (props) => ({ ...props, global: true });
    const localMiddleware: MiddlewareFn = (props) => ({ ...props, local: true });

    const ParentProvider = createScheptaProvider({
      middlewares: [globalMiddleware],
    });

    const ChildProvider = createScheptaProvider({
      middlewares: [localMiddleware],
    });

    const MiddlewareConsumer = {
      setup() {
        const context = useSchepta();
        const hasCorrectLength = context.middlewares.length === 2;
        const firstIsGlobal = context.middlewares[0] === globalMiddleware;
        const secondIsLocal = context.middlewares[1] === localMiddleware;
        return () => h('div', { 'data-testid': 'middlewares' }, hasCorrectLength && firstIsGlobal && secondIsLocal ? 'merged' : 'not-merged');
      },
    };

    const wrapper = mount(ParentProvider, {
      slots: {
        default: () => h(ChildProvider, {}, {
          default: () => h(MiddlewareConsumer),
        }),
      },
    });

    expect(wrapper.find('[data-testid="middlewares"]').text()).toBe('merged');
  });

  it('should merge externalContext hierarchically', () => {
    const ParentProvider = createScheptaProvider({
      externalContext: { api: 'https://api.example.com' },
    });

    const ChildProvider = createScheptaProvider({
      externalContext: { user: { id: 1 } },
    });

    const ContextConsumer = {
      setup() {
        const context = useSchepta();
        const hasUser = context.externalContext.user !== undefined;
        const hasApi = context.externalContext.api !== undefined;
        return () => h('div', { 'data-testid': 'external-context' }, hasUser && hasApi ? 'merged' : 'not-merged');
      },
    };

    const wrapper = mount(ParentProvider, {
      slots: {
        default: () => h(ChildProvider, {}, {
          default: () => h(ContextConsumer),
        }),
      },
    });

    expect(wrapper.find('[data-testid="external-context"]').text()).toBe('merged');
  });

  it('should throw error when useSchepta is used without provider', () => {
    const TestComponent = {
      setup() {
        expect(() => useSchepta()).toThrow(
          'useSchepta must be used within a ScheptaProvider'
        );
        return () => h('div', 'test');
      },
    };

    mount(TestComponent);
  });

  it('should return null when useScheptaContext is used without provider', () => {
    const TestComponent = {
      setup() {
        const context = useScheptaContext();
        return () => h('div', { 'data-testid': 'context' }, context ? 'has-context' : 'no-context');
      },
    };

    const wrapper = mount(TestComponent);
    expect(wrapper.find('[data-testid="context"]').text()).toBe('no-context');
  });
});

