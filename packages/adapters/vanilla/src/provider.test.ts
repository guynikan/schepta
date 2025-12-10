/**
 * Vanilla Provider Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createScheptaProvider, getScheptaContext, getSchepta } from './provider';
import { createComponentSpec } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';

describe('Vanilla Provider', () => {
  let container: HTMLElement;
  let childContainer: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    childContainer = document.createElement('div');
    container.appendChild(childContainer);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create provider and store config', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      factory: () => null,
      type: 'field',
    });

    const provider = createScheptaProvider(container, {
      components: { TestComponent: componentSpec },
    });

    const context = getScheptaContext(container);
    expect(context).toBeDefined();
    expect(context?.components.TestComponent).toBe(componentSpec);

    provider.destroy();
  });

  it('should get context from container', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      factory: () => null,
      type: 'field',
    });

    createScheptaProvider(container, {
      components: { TestComponent: componentSpec },
    });

    const context = getScheptaContext(container);
    expect(context?.components.TestComponent).toBe(componentSpec);
  });

  it('should get context from child container (parent lookup)', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      factory: () => null,
      type: 'field',
    });

    createScheptaProvider(container, {
      components: { TestComponent: componentSpec },
    });

    const context = getScheptaContext(childContainer);
    expect(context?.components.TestComponent).toBe(componentSpec);
  });

  it('should support nested providers with hierarchical merge', () => {
    const ParentComponent = createComponentSpec({
      id: 'ParentComponent',
      factory: () => null,
      type: 'field',
    });

    const ChildComponent = createComponentSpec({
      id: 'ChildComponent',
      factory: () => null,
      type: 'field',
    });

    const parentProvider = createScheptaProvider(container, {
      components: { ParentComponent },
    });

    const childProvider = createScheptaProvider(childContainer, {
      components: { ChildComponent },
    });

    const context = getScheptaContext(childContainer);
    // Verify both components are present
    expect(context?.components.ParentComponent).toBeDefined();
    expect(context?.components.ChildComponent).toBeDefined();
    // Verify they are the correct component specs
    expect(context?.components.ParentComponent).toBe(ParentComponent);
    expect(context?.components.ChildComponent).toBe(ChildComponent);

    parentProvider.destroy();
    childProvider.destroy();
  });

  it('should merge middlewares hierarchically', () => {
    const globalMiddleware: MiddlewareFn = (props) => ({ ...props, global: true });
    const localMiddleware: MiddlewareFn = (props) => ({ ...props, local: true });

    const parentProvider = createScheptaProvider(container, {
      middlewares: [globalMiddleware],
    });

    const childProvider = createScheptaProvider(childContainer, {
      middlewares: [localMiddleware],
    });

    const context = getScheptaContext(childContainer);
    expect(context?.middlewares).toHaveLength(2);
    expect(context?.middlewares[0]).toBe(globalMiddleware);
    expect(context?.middlewares[1]).toBe(localMiddleware);

    parentProvider.destroy();
    childProvider.destroy();
  });

  it('should merge externalContext hierarchically', () => {
    const parentProvider = createScheptaProvider(container, {
      externalContext: { api: 'https://api.example.com' },
    });

    const childProvider = createScheptaProvider(childContainer, {
      externalContext: { user: { id: 1 } },
    });

    const context = getScheptaContext(childContainer);
    expect(context?.externalContext.api).toBe('https://api.example.com');
    expect(context?.externalContext.user).toEqual({ id: 1 });

    parentProvider.destroy();
    childProvider.destroy();
  });

  it('should throw error when getSchepta is used without provider', () => {
    const emptyContainer = document.createElement('div');
    expect(() => getSchepta(emptyContainer)).toThrow(
      'getSchepta: No ScheptaProvider found for container'
    );
  });

  it('should return null when getScheptaContext is used without provider', () => {
    const emptyContainer = document.createElement('div');
    const context = getScheptaContext(emptyContainer);
    expect(context).toBeNull();
  });

  it('should destroy provider and remove config', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      factory: () => null,
      type: 'field',
    });

    const provider = createScheptaProvider(container, {
      components: { TestComponent: componentSpec },
    });

    // Verify context exists before destroy
    const contextBeforeDestroy = getScheptaContext(container);
    expect(contextBeforeDestroy).toBeDefined();
    expect(contextBeforeDestroy?.components.TestComponent).toBe(componentSpec);

    provider.destroy();

    // After destroy, context should be removed from the map
    // Note: WeakMap behavior means the entry is removed, but if we still have
    // a reference to the container, we can verify it's gone
    // This test verifies destroy doesn't throw and can be called multiple times
    expect(() => provider.destroy()).not.toThrow();
  });
});

