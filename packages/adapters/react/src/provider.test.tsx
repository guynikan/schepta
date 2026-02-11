/**
 * React Provider Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScheptaProvider, useScheptaContext, useSchepta } from './provider';
import { createComponentSpec } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';

// Test component that uses the provider
function TestConsumer() {
  const context = useScheptaContext();
  return <div data-testid="context">{context ? 'has-context' : 'no-context'}</div>;
}

function TestConsumerRequired() {
  const context = useSchepta();
  return <div data-testid="context-required">{context ? 'has-context' : 'no-context'}</div>;
}

describe('ScheptaProvider', () => {
  it('should provide context to children', () => {
    render(
      <ScheptaProvider>
        <TestConsumer />
      </ScheptaProvider>
    );

    expect(screen.getByTestId('context')).toHaveTextContent('has-context');
  });

  it('should provide components configuration', () => {
    const componentSpec = createComponentSpec({
      id: 'TestComponent',
      component: () => null,
      type: 'field',
    });

    function ComponentConsumer() {
      const context = useSchepta();
      const hasComponent = context.components.TestComponent !== undefined;
      const isCorrectComponent = context.components.TestComponent === componentSpec;
      return (
        <div data-testid="component">
          {hasComponent && isCorrectComponent ? 'has-component' : 'no-component'}
        </div>
      );
    }

    render(
      <ScheptaProvider components={{ TestComponent: componentSpec }}>
        <ComponentConsumer />
      </ScheptaProvider>
    );

    expect(screen.getByTestId('component')).toHaveTextContent('has-component');
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

    function NestedConsumer() {
      const context = useSchepta();
      const hasParent = context.components.ParentComponent !== undefined;
      const hasChild = context.components.ChildComponent !== undefined;
      return (
        <div data-testid="nested">
          {hasParent && hasChild ? 'both' : 'missing'}
        </div>
      );
    }

    render(
      <ScheptaProvider components={{ ParentComponent }}>
        <ScheptaProvider components={{ ChildComponent }}>
          <NestedConsumer />
        </ScheptaProvider>
      </ScheptaProvider>
    );

    expect(screen.getByTestId('nested')).toHaveTextContent('both');
  });

  it('should merge middlewares hierarchically', () => {
    const globalMiddleware: MiddlewareFn = (props) => ({ ...props, global: true });
    const localMiddleware: MiddlewareFn = (props) => ({ ...props, local: true });

    function MiddlewareConsumer() {
      const context = useSchepta();
      const hasCorrectLength = context.middlewares.length === 2;
      const firstIsGlobal = context.middlewares[0] === globalMiddleware;
      const secondIsLocal = context.middlewares[1] === localMiddleware;
      return (
        <div data-testid="middlewares">
          {hasCorrectLength && firstIsGlobal && secondIsLocal ? 'merged' : 'not-merged'}
        </div>
      );
    }

    render(
      <ScheptaProvider middlewares={[globalMiddleware]}>
        <ScheptaProvider middlewares={[localMiddleware]}>
          <MiddlewareConsumer />
        </ScheptaProvider>
      </ScheptaProvider>
    );

    expect(screen.getByTestId('middlewares')).toHaveTextContent('merged');
  });

  it('should merge externalContext hierarchically', () => {
    function ContextConsumer() {
      const context = useSchepta();
      return (
        <div data-testid="external-context">
          {context.externalContext.user && context.externalContext.api
            ? 'merged'
            : 'not-merged'}
        </div>
      );
    }

    render(
      <ScheptaProvider externalContext={{ api: 'https://api.example.com' }}>
        <ScheptaProvider externalContext={{ user: { id: 1 } }}>
          <ContextConsumer />
        </ScheptaProvider>
      </ScheptaProvider>
    );

    expect(screen.getByTestId('external-context')).toHaveTextContent('merged');
  });

  it('should throw error when useSchepta is used without provider', () => {
    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestConsumerRequired />);
    }).toThrow('useSchepta must be used within a ScheptaProvider');

    console.error = consoleError;
  });

  it('should return null when useScheptaContext is used without provider', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('context')).toHaveTextContent('no-context');
  });

  it('should merge debug configuration', () => {
    function DebugConsumer() {
      const context = useSchepta();
      return (
        <div data-testid="debug">
          {context.debug.enabled ? 'enabled' : 'disabled'}
        </div>
      );
    }

    render(
      <ScheptaProvider debug={{ enabled: true }}>
        <DebugConsumer />
      </ScheptaProvider>
    );

    expect(screen.getByTestId('debug')).toHaveTextContent('enabled');
  });
});

