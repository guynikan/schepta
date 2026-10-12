import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheptaExpressionError, type FormSchema } from '@schepta/core';
import { createFormFactory, type FormFactoryResult } from './form-factory';

// jexl is a dependency of @schepta/core, not of this package: load the instance core uses.
const require = createRequire(import.meta.url);
const jexl = createRequire(require.resolve('@schepta/core'))('jexl');
// Form inputs produce strings, so this transform throws a TypeError for them.
jexl.addTransform('money', (value: number) => value.toFixed(2));

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

  it('mounts in strict mode while an indexed $externalContext value is still null', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const first = field('first');
    (first.properties.first as any)['x-component-props'].label = 'First: {{ $externalContext.products[0].name }}';
    const initial = field('initial');
    (initial.properties.initial as any)['x-component-props'].label = 'Initial: {{ $formValues.profile.nickname[0] }}';

    const { container, factory: form } = mount({
      schema: createSchema({ nickname: field('nickname'), first, initial }),
      externalContext: { products: null },
      initialValues: { profile: { nickname: null } },
      expressions: { onError: 'throw', onExpressionError: report },
    });

    expect(input(container, 'first')).not.toBeNull();
    expect(container.textContent).toContain('First: ');
    expect(container.textContent).toContain('Initial: ');

    // Clearing a mounted field to null re-renders without throwing either.
    form.formAdapter.setValue('profile.nickname', 'abc');
    await nextRender();
    expect(container.textContent).toContain('Initial: a');
    form.formAdapter.setValue('profile.nickname', null);
    await nextRender();
    expect(container.textContent).not.toContain('Initial: a');

    // External data that is not loaded yet warns once; the declared field is quiet.
    expect(report.mock.calls.map(([error]) => [error.code, error.missingPath])).toEqual([
      ['EXPRESSION_PATH_NOT_FOUND', '$externalContext.products'],
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a declared field', '$formValues.profile.items[0].price|money'],
    ['external data', '$externalContext.products[0].price|money'],
  ])('throws in strict mode for a transform that throws behind an index in %s', (_label, expression) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const total = field('total');
    (total.properties.total as any)['x-component-props'].label = `Total: {{ ${expression} }}`;
    const options = {
      schema: createSchema({ items: field('items'), total }),
      externalContext: { products: [{ price: '10' }] },
      initialValues: { profile: { items: [{ price: '10' }] } },
    };

    const strictContainer = document.createElement('div');
    expect(() => createFormFactory({
      ...options, container: strictContainer, expressions: { onError: 'throw' },
    })).toThrow(expect.objectContaining({ code: 'EXPRESSION_EVALUATION_ERROR', expression }));
    expect(input(strictContainer, 'total')).toBeNull();

    // Default mode keeps rendering and reports the error once, with no missing path.
    const report = vi.fn();
    const { container } = mount({ ...options, expressions: { onExpressionError: report } });
    expect(input(container, 'total')).not.toBeNull();
    expect(container.textContent).toContain('Total: ');
    expect(report.mock.calls.map(([error]) => [error.code, error.missingPath])).toEqual([
      ['EXPRESSION_EVALUATION_ERROR', undefined],
    ]);

    // The same transform over a number evaluates.
    const loaded = mount({
      ...options,
      externalContext: { products: [{ price: 10 }] },
      initialValues: { profile: { items: [{ price: 10 }] } },
      expressions: { onError: 'throw' },
    });
    expect(loaded.container.textContent).toContain('Total: 10.00');
  });

  it('throws in strict mode for a JavaScript method call, which JEXL does not support', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const expression = '$formValues.profile.nickname.toUpperCase()';
    const shout = field('shout');
    (shout.properties.shout as any)['x-component-props'].label = `{{ ${expression} }}`;
    const schema = createSchema({ nickname: field('nickname'), shout });

    expect(() => createFormFactory({
      container: document.createElement('div'),
      schema,
      initialValues: { profile: { nickname: 'abc' } },
      expressions: { onError: 'throw' },
    })).toThrow(expect.objectContaining({
      code: 'EXPRESSION_EVALUATION_ERROR',
      expression,
      message: expect.stringMatching(/JEXL does not support calling JavaScript methods.*transform/),
    }));

    // Default mode keeps rendering, with the value the expression always had.
    const report = vi.fn();
    const { container } = mount({ schema, expressions: { onExpressionError: report } });
    expect(input(container, 'shout')).not.toBeNull();
    expect(report.mock.calls.map(([error]) => error.code)).toEqual(['EXPRESSION_EVALUATION_ERROR']);
  });
});
