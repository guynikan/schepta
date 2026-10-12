import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { ScheptaExpressionError, type ExpressionConfig, type FormSchema } from '@schepta/core';
import { createScheptaProvider } from '@schepta/adapter-vue';
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

describe('FormFactory expression diagnostics', () => {
  let wrapper: VueWrapper<any> | undefined;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.restoreAllMocks();
  });

  const input = (name: string) => wrapper!.find<HTMLInputElement>(`input[name="profile.${name}"]`);

  it('reports each invalid visibility expression exactly once', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    wrapper = mount(FormFactory, {
      props: { schema: diagnosticsSchema(), expressions: { onExpressionError: report } },
    });

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

    wrapper = mount(FormFactory, {
      props: {
        schema: createSchema({ nickname: field('nickname'), conditional: field('conditional', VALID) }),
        expressions: { onExpressionError: report, onError: 'throw' },
      },
    });

    expect(report).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(input('nickname').exists()).toBe(true);
    expect(input('conditional').exists()).toBe(false);
  });

  it('does not report again when field values change', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    wrapper = mount(FormFactory, {
      props: { schema: diagnosticsSchema(), expressions: { onExpressionError: report } },
    });
    expect(report).toHaveBeenCalledTimes(3);
    expect(input('conditional').exists()).toBe(false);

    await input('other').setValue('changed');
    expect(wrapper.vm.getValues()).toMatchObject({ profile: { other: 'changed' } });

    // Proves the value change really evaluated the expressions again.
    await input('nickname').setValue('show');
    expect(input('conditional').exists()).toBe(true);

    wrapper.vm.reset({});
    await nextTick();
    expect(input('conditional').exists()).toBe(false);

    expect(report).toHaveBeenCalledTimes(3);
  });

  it('does not report again when the parent re-renders with an inline expressions object', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const schema = diagnosticsSchema();
    const renders = ref(0);
    const seen: ExpressionConfig[] = [];
    const Parent = defineComponent({
      setup: () => () => {
        // A fresh object on every parent render, as in `:expressions="{ ... }"`.
        const expressions: ExpressionConfig = { onExpressionError: report };
        seen.push(expressions);
        return h('div', { 'data-renders': renders.value }, [h(FormFactory, { schema, expressions })]);
      },
    });

    wrapper = mount(Parent);
    expect(report).toHaveBeenCalledTimes(3);

    renders.value += 1;
    await nextTick();
    renders.value += 1;
    await nextTick();
    expect(wrapper.attributes('data-renders')).toBe('2');
    expect(new Set(seen).size).toBe(3);

    await input('other').setValue('changed');
    await input('nickname').setValue('show');
    expect(input('conditional').exists()).toBe(true);

    expect(report).toHaveBeenCalledTimes(3);
  });

  it('does not report again when setProps replaces the expressions object', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    wrapper = mount(FormFactory, {
      props: { schema: diagnosticsSchema(), expressions: { onExpressionError: report } },
    });

    await wrapper.setProps({ expressions: { onExpressionError: report } });
    await wrapper.setProps({ expressions: { onExpressionError: report } });
    await input('nickname').setValue('show');

    expect(report).toHaveBeenCalledTimes(3);
  });

  it('reports once when expressions come from ScheptaProvider', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();
    const schema = diagnosticsSchema();

    wrapper = mount(createScheptaProvider({ expressions: { onExpressionError: report } }), {
      slots: { default: () => h(FormFactory, { schema }) },
    });
    await input('other').setValue('changed');

    expect(report).toHaveBeenCalledTimes(3);
  });

  it('keeps fields with an invalid visibility condition visible', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    wrapper = mount(FormFactory, { props: { schema: diagnosticsSchema() } });

    expect(input('typo').exists()).toBe(true);
    expect(input('unknownRoot').exists()).toBe(true);
    expect(input('syntax').exists()).toBe(true);
    expect(input('conditional').exists()).toBe(false);
  });

  it('warns once per invalid expression by default', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    wrapper = mount(FormFactory, { props: { schema: diagnosticsSchema() } });

    await input('other').setValue('changed');

    const messages = warn.mock.calls.map(([message]) => String(message));
    expect(messages.filter(message => message.startsWith('Invalid expression'))).toHaveLength(3);
  });

  it.each([
    ['a typo inside a comparison', 'typo', TYPO, 'EXPRESSION_PATH_NOT_FOUND'],
    ['an unknown root variable', 'unknownRoot', UNKNOWN_ROOT, 'UNKNOWN_EXPRESSION_VARIABLE'],
    ['a syntax error', 'syntax', SYNTAX_ERROR, 'EXPRESSION_EVALUATION_ERROR'],
  ])('throws ScheptaExpressionError in strict mode for %s', (_label, key, expression, code) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const report = vi.fn();

    let thrown: unknown;
    try {
      mount(FormFactory, {
        props: {
          schema: createSchema({ nickname: field('nickname'), [key]: field(key, expression) }),
          expressions: { onError: 'throw', onExpressionError: report },
        },
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
