import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { ScheptaExpressionError, type FormSchema } from '@schepta/core';
import { ScheptaProvider } from '@schepta/adapter-react';
import { FormFactory } from './form-factory';

const TYPO = "$formValues.profile.nicknmae === 'show'";
const UNKNOWN_ROOT = "$session.role === 'admin'";
const SYNTAX_ERROR = "$formValues.profile.nickname ===";
const VALID = "$formValues.profile.nickname === 'show'";

let order = 0;

function field(name: string, visible?: string) {
  return {
    type: 'object',
    'x-component': 'FormField',
    'x-ui': { order: ++order, ...(visible ? { visible: `{{ ${visible} }}` } : {}) },
    properties: {
      [name]: { type: 'string', 'x-component': 'InputText', 'x-component-props': { label: name } },
    },
  };
}

function createSchema(fields: Record<string, unknown>): FormSchema {
  return {
    $id: 'expression-diagnostics-form',
    type: 'object',
    'x-component': 'FormContainer',
    properties: {
      profile: {
        type: 'object',
        'x-component': 'FormSectionContainer',
        'x-ui': { order: 1 },
        properties: {
          fields: {
            type: 'object',
            'x-component': 'FormSectionGroupContainer',
            properties: {
              group: { type: 'object', 'x-component': 'FormSectionGroup', properties: fields },
            },
          },
        },
      },
    },
  } as unknown as FormSchema;
}

function diagnosticsSchema(): FormSchema {
  return createSchema({
    nickname: field('nickname'),
    other: field('other'),
    typo: field('typo', TYPO),
    unknownRoot: field('unknownRoot', UNKNOWN_ROOT),
    syntax: field('syntax', SYNTAX_ERROR),
    conditional: field('conditional', VALID),
  });
}

const visiblePath = (key: string) =>
  `properties.profile.properties.fields.properties.group.properties.${key}.x-ui.visible`;

const input = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLInputElement>(`input[name="profile.${name}"]`);

describe('FormFactory expression diagnostics', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('reports each invalid visibility expression exactly once', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    render(<FormFactory schema={diagnosticsSchema()} expressions={{ onExpressionError: report }} />);

    expect(report).toHaveBeenCalledTimes(3);
    expect(report.mock.calls.map(([error]) => error)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'EXPRESSION_PATH_NOT_FOUND',
        expression: TYPO,
        path: visiblePath('typo'),
        missingPath: '$formValues.profile.nicknmae',
      }),
      expect.objectContaining({ code: 'UNKNOWN_EXPRESSION_VARIABLE', expression: UNKNOWN_ROOT, path: visiblePath('unknownRoot') }),
      expect.objectContaining({ code: 'EXPRESSION_EVALUATION_ERROR', expression: SYNTAX_ERROR, path: visiblePath('syntax') }),
    ]));
  });

  it('stays quiet in strict mode for a valid condition over a declared empty field', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    const { container } = render(
      <FormFactory
        schema={createSchema({ nickname: field('nickname'), conditional: field('conditional', VALID) })}
        expressions={{ onError: 'throw', onExpressionError: report }}
      />,
    );

    expect(report).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(input(container, 'nickname')).not.toBeNull();
    expect(input(container, 'conditional')).toBeNull();

    fireEvent.change(input(container, 'nickname')!, { target: { value: 'show' } });
    expect(input(container, 'conditional')).not.toBeNull();
    expect(report).not.toHaveBeenCalled();
  });

  it('keeps the visibility an invalid condition had before diagnostics existed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(<FormFactory schema={diagnosticsSchema()} />);

    // A comparison with a missing operand is false, so the field stays hidden.
    expect(input(container, 'typo')).toBeNull();
    expect(input(container, 'unknownRoot')).toBeNull();
    // A condition that cannot be evaluated is undefined, so the field renders.
    expect(input(container, 'syntax')).not.toBeNull();
    expect(input(container, 'conditional')).toBeNull();
  });

  it('keeps conditions over optional $externalContext keys hidden without throwing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    const { container } = render(
      <FormFactory
        schema={createSchema({
          nickname: field('nickname'),
          adminOnly: field('adminOnly', '$externalContext.user.isAdmin == true'),
        })}
        externalContext={{ user: { name: 'x' } }}
        expressions={{ onError: 'throw', onExpressionError: report }}
      />,
    );

    expect(input(container, 'nickname')).not.toBeNull();
    expect(input(container, 'adminOnly')).toBeNull();
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(expect.objectContaining({ missingPath: '$externalContext.user.isAdmin' }));
  });

  it.each([
    ['a typo inside a comparison', 'typo', TYPO, 'EXPRESSION_PATH_NOT_FOUND'],
    ['an unknown root variable', 'unknownRoot', UNKNOWN_ROOT, 'UNKNOWN_EXPRESSION_VARIABLE'],
    ['a syntax error', 'syntax', SYNTAX_ERROR, 'EXPRESSION_EVALUATION_ERROR'],
  ])('throws ScheptaExpressionError in strict mode for %s', (_label, key, expression, code) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // React logs errors thrown during render.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const report = vi.fn();

    let thrown: unknown;
    try {
      render(
        <FormFactory
          schema={createSchema({ nickname: field('nickname'), [key]: field(key, expression) })}
          expressions={{ onError: 'throw', onExpressionError: report }}
        />,
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ScheptaExpressionError);
    expect(thrown).toMatchObject({ code, expression, path: visiblePath(key) });
    // React retries a mount that threw with fresh state before giving up, so
    // the handler can run once per attempt: a form that never mounted has no
    // lifetime to de-duplicate over.
    expect(report).toHaveBeenCalledWith(expect.objectContaining({ code, expression }));
    expect(report.mock.calls.every(([error]) => error.code === code)).toBe(true);
  });

  it('reports once and calls the latest handler when it is an inline closure', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const handlers = new Set<unknown>();
    let rerender!: () => void;
    let setSchema!: (schema: FormSchema) => void;

    function Parent() {
      const [generation, setGeneration] = useState(0);
      const [schema, updateSchema] = useState(diagnosticsSchema);
      rerender = () => setGeneration(current => current + 1);
      setSchema = updateSchema;
      // A new function on every parent render.
      const onExpressionError = (error: ScheptaExpressionError) => report(generation, error.code);
      handlers.add(onExpressionError);
      return <FormFactory schema={schema} expressions={{ onExpressionError }} />;
    }

    const { container } = render(<Parent />);
    for (let index = 0; index < 4; index++) act(() => rerender());

    expect(handlers.size).toBe(5);
    expect(report).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledTimes(3);

    fireEvent.change(input(container, 'nickname')!, { target: { value: 'show' } });
    expect(input(container, 'conditional')).not.toBeNull();
    expect(report).toHaveBeenCalledTimes(3);

    // A problem that first appears later goes to the handler of the latest render.
    act(() => setSchema(createSchema({ late: field('late', "$formValues.profile.lat === 'x'") })));
    expect(report).toHaveBeenCalledTimes(4);
    expect(report).toHaveBeenLastCalledWith(4, 'EXPRESSION_PATH_NOT_FOUND');
  });

  it('reports once when expressions come from ScheptaProvider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    const { container } = render(
      <ScheptaProvider expressions={{ onExpressionError: report }}>
        <FormFactory schema={diagnosticsSchema()} />
      </ScheptaProvider>,
    );
    fireEvent.change(input(container, 'other')!, { target: { value: 'changed' } });

    expect(report).toHaveBeenCalledTimes(3);
  });
});
