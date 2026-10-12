import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheptaExpressionError, type FormSchema } from '@schepta/core';
import { createFormFactory, type FormFactoryResult } from './form-factory';

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

/** Flush the requestAnimationFrame-batched re-render of the vanilla factory. */
const nextRender = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

describe('createFormFactory expression diagnostics', () => {
  let factory: FormFactoryResult | undefined;

  afterEach(() => {
    factory?.destroy();
    factory = undefined;
    vi.restoreAllMocks();
  });

  function mount(options: Partial<Parameters<typeof createFormFactory>[0]> = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    factory = createFormFactory({ container, schema: diagnosticsSchema(), ...options });
    return { container, factory };
  }

  const input = (container: HTMLElement, name: string) =>
    container.querySelector<HTMLInputElement>(`input[name="profile.${name}"]`);

  it('reports each invalid visibility expression exactly once', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    mount({ expressions: { onExpressionError: report } });

    expect(report).toHaveBeenCalledTimes(3);
    const errors = report.mock.calls.map(([error]) => error);
    expect(errors.every(error => error instanceof ScheptaExpressionError)).toBe(true);
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'EXPRESSION_PATH_NOT_FOUND',
        expression: TYPO,
        path: visiblePath('typo'),
        missingPath: '$formValues.profile.nicknmae',
      }),
      expect.objectContaining({
        code: 'UNKNOWN_EXPRESSION_VARIABLE',
        expression: UNKNOWN_ROOT,
        path: visiblePath('unknownRoot'),
      }),
      expect.objectContaining({
        code: 'EXPRESSION_EVALUATION_ERROR',
        expression: SYNTAX_ERROR,
        path: visiblePath('syntax'),
      }),
    ]));
  });

  it('stays quiet for a valid condition over a declared empty field', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);

    factory = createFormFactory({
      container,
      schema: createSchema({ nickname: field('nickname'), conditional: field('conditional', VALID) }),
      expressions: { onExpressionError: report, onError: 'throw' },
    });

    expect(report).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(input(container, 'nickname')).not.toBeNull();
    expect(input(container, 'conditional')).toBeNull();
  });

  it('does not report again when the form re-renders after value changes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const { container, factory: form } = mount({ expressions: { onExpressionError: report } });
    expect(report).toHaveBeenCalledTimes(3);
    expect(input(container, 'conditional')).toBeNull();

    form.formAdapter.setValue('profile.other', 'changed');
    await nextRender();
    expect(input(container, 'other')?.value).toBe('changed');

    // Proves the re-render really evaluated the expressions again.
    form.formAdapter.setValue('profile.nickname', 'show');
    await nextRender();
    expect(input(container, 'conditional')).not.toBeNull();

    form.reset({});
    await nextRender();
    expect(input(container, 'conditional')).toBeNull();

    expect(report).toHaveBeenCalledTimes(3);
  });

  it('keeps the visibility an invalid condition had before diagnostics existed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = mount();

    // A comparison with a missing operand is false, so the field stays hidden.
    expect(input(container, 'typo')).toBeNull();
    expect(input(container, 'unknownRoot')).toBeNull();
    // A condition that cannot be evaluated is undefined, so the field renders.
    expect(input(container, 'syntax')).not.toBeNull();
    expect(input(container, 'conditional')).toBeNull();
  });

  it('keeps conditions over optional $externalContext keys hidden and disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const locked = field('locked');
    (locked.properties.locked as any)['x-component-props'].disabled = "{{ $externalContext.user.role != 'admin' }}";
    const { container } = mount({
      schema: createSchema({
        nickname: field('nickname'),
        adminOnly: field('adminOnly', '$externalContext.user.isAdmin == true'),
        locked,
      }),
      externalContext: { user: { name: 'x' } },
      // Strict mode on purpose: optional external keys only warn.
      expressions: { onError: 'throw', onExpressionError: report },
    });

    expect(input(container, 'adminOnly')).toBeNull();
    expect(input(container, 'locked')?.disabled).toBe(true);
    expect(report.mock.calls.map(([error]) => error.missingPath)).toEqual([
      '$externalContext.user.isAdmin', '$externalContext.user.role',
    ]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('warns once per invalid expression by default', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { factory: form } = mount();

    form.formAdapter.setValue('profile.other', 'changed');
    await nextRender();

    const messages = warn.mock.calls.map(([message]) => String(message));
    expect(messages.filter(message => message.startsWith('Invalid expression'))).toHaveLength(3);
  });

  it.each([
    ['a typo inside a comparison', 'typo', TYPO, 'EXPRESSION_PATH_NOT_FOUND'],
    ['an unknown root variable', 'unknownRoot', UNKNOWN_ROOT, 'UNKNOWN_EXPRESSION_VARIABLE'],
    ['a syntax error', 'syntax', SYNTAX_ERROR, 'EXPRESSION_EVALUATION_ERROR'],
  ])('throws ScheptaExpressionError in strict mode for %s', (_label, key, expression, code) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const report = vi.fn();
    const container = document.createElement('div');

    let thrown: unknown;
    try {
      createFormFactory({
        container,
        schema: createSchema({ nickname: field('nickname'), [key]: field(key, expression) }),
        expressions: { onError: 'throw', onExpressionError: report },
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ScheptaExpressionError);
    expect(thrown).toMatchObject({ code, expression, path: visiblePath(key) });
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(thrown);
  });
});
