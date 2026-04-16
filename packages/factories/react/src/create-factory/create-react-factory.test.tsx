/**
 * createReactFactory integration tests
 *
 * Exercises the generic factory primitive with a synthetic factory that is
 * not a form. Validates:
 *   - Custom `rootComponentKey` produces a functional tree.
 *   - The `useSetup` hook receives props, mergedConfig, and can expose a ref
 *     API via `useImperativeHandle`.
 *   - Coexistence: two factories (FormFactory + a user-defined factory)
 *     render in the same React tree under a single `ScheptaProvider` without
 *     colliding on component defaults.
 */

import React, { useRef, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { createComponentSpec } from '@schepta/core';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from '../form-factory';
import { createReactFactory } from './create-react-factory';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- JSON module
import simpleFormInstance from '../../../../../instances/form/simple-form.json';

interface CounterFactoryProps {
  schema: any;
  initialCount?: number;
}

interface CounterFactoryRef {
  getCount: () => number;
  increment: () => void;
}

function Counter({ value, onIncrement }: { value: number; onIncrement: () => void }) {
  return (
    <button
      type="button"
      data-testid="counter-button"
      onClick={onIncrement}
    >
      count is {value}
    </button>
  );
}

function CounterLabel({ 'x-component-props': props }: any) {
  return <span data-testid="counter-label">{props?.text || 'unlabeled'}</span>;
}

const counterDefaults = {
  CounterRoot: createComponentSpec({
    id: 'CounterRoot',
    type: 'container',
      component: () =>
        function CounterRoot({ children, 'x-component-props': props }: any) {
          return (
            <div data-testid="counter-root">
              <strong data-testid="counter-title">{props?.title || 'Counter'}</strong>
              {children}
            </div>
          );
        },
  }),
  CounterLabel: createComponentSpec({
    id: 'CounterLabel',
    type: 'content',
    component: () => CounterLabel,
  }),
};

const CounterFactory = createReactFactory<CounterFactoryProps, CounterFactoryRef>({
  displayName: 'CounterFactory',
  schemaDefinition: {
    type: 'object',
    properties: {
      type: { const: 'object' },
      'x-component': { const: 'CounterRoot' },
    },
  } as object,
  rootComponentKey: 'CounterRoot',
  defaultComponents: counterDefaults,
  useSetup: ({ props }) => {
    const [count, setCount] = useState(props.initialCount ?? 0);

    const refApi: CounterFactoryRef = {
      getCount: () => count,
      increment: () => setCount((v) => v + 1),
    };

    return {
      state: { count },
      refApi,
      wrap: (children) => (
        <>
          <Counter value={count} onIncrement={() => setCount((v) => v + 1)} />
          {children}
        </>
      ),
    };
  },
});

describe('createReactFactory', () => {
  it('renders a synthetic factory using a custom rootComponentKey', () => {
    const schema = {
      type: 'object',
      'x-component': 'CounterRoot',
      'x-component-props': { title: 'My Counter' },
      properties: {
        label: {
          type: 'object',
          'x-component': 'CounterLabel',
          'x-component-props': { text: 'Hello from factory' },
        },
      },
    };

    const { getByTestId } = render(<CounterFactory schema={schema} />);
    expect(getByTestId('counter-root')).toBeInTheDocument();
    expect(getByTestId('counter-title').textContent).toBe('My Counter');
    expect(getByTestId('counter-label').textContent).toBe('Hello from factory');
  });

  it('exposes an imperative ref API via useImperativeHandle', () => {
    const schema = {
      type: 'object',
      'x-component': 'CounterRoot',
      properties: {
        label: {
          type: 'object',
          'x-component': 'CounterLabel',
          'x-component-props': { text: 'label' },
        },
      },
    };

    function Harness() {
      const ref = useRef<CounterFactoryRef>(null);
      return (
        <div>
          <CounterFactory schema={schema} initialCount={5} ref={ref} />
          <button
            type="button"
            data-testid="external-read"
            onClick={() => {
              (document.getElementById('external-read-result') as HTMLElement).textContent =
                String(ref.current?.getCount() ?? 'null');
            }}
          >
            read
          </button>
          <span id="external-read-result" />
        </div>
      );
    }

    const { getByTestId, container } = render(<Harness />);

    fireEvent.click(getByTestId('external-read'));
    expect(container.querySelector('#external-read-result')?.textContent).toBe('5');

    fireEvent.click(getByTestId('counter-button'));
    fireEvent.click(getByTestId('external-read'));
    expect(container.querySelector('#external-read-result')?.textContent).toBe('6');
  });
});

describe('Factory coexistence', () => {
  it('renders FormFactory and a user-defined factory under the same provider without collision', () => {
    const counterSchema = {
      type: 'object',
      'x-component': 'CounterRoot',
      properties: {
        label: {
          type: 'object',
          'x-component': 'CounterLabel',
          'x-component-props': { text: 'coexistent' },
        },
      },
    };

    const { getByTestId, getByText } = render(
      <ScheptaProvider>
        <FormFactory schema={simpleFormInstance as any} />
        <CounterFactory schema={counterSchema} />
      </ScheptaProvider>
    );

    expect(getByTestId('counter-root')).toBeInTheDocument();
    expect(getByTestId('counter-label').textContent).toBe('coexistent');
    expect(getByText('Personal Information')).toBeInTheDocument();
    expect(getByText('First Name')).toBeInTheDocument();
  });
});
