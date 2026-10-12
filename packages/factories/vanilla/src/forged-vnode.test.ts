import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFormFactory } from './form-factory';
import type { FormSchema } from '@schepta/core';

// The payloads that mount real elements in Vue (a VNode forged in JSON) plus
// the React counterpart. Here they must render as empty text and never crash.
const FORGED_IMG = { __v_isVNode: true, type: 'img', props: { src: 'x', onerror: 'alert(document.domain)' }, shapeFlag: 1 };
const FORGED_HTML = { __v_isVNode: true, type: 'div', props: { innerHTML: '<img src=x onerror=alert(1)>' }, shapeFlag: 1 };
const FORGED_LINK = { __v_isVNode: true, type: 'a', props: { href: 'javascript:alert(3)' }, shapeFlag: 9, children: 'click' };
const FORGED_REACT_ELEMENT = { $$typeof: 'Symbol(react.element)', type: 'img', props: { src: 'x', onerror: 'alert(1)' }, key: null, ref: null };
const FORGED_VNODES = [FORGED_IMG, FORGED_HTML, FORGED_LINK, FORGED_REACT_ELEMENT];

const INPUT_TYPES: Record<string, string> = {
  InputText: 'string', InputTextarea: 'string', InputNumber: 'number', InputDate: 'string', InputPhone: 'string',
  InputSelect: 'string', InputAutocomplete: 'string', InputCheckbox: 'boolean',
};
const INPUTS = Object.keys(INPUT_TYPES);
// Inputs whose `label` the meta-schema does not type, so the payload reaches
// the component itself.
const META_SCHEMA_ACCEPTS_OBJECT_LABEL = ['InputTextarea', 'InputNumber'];
const LEVELS = ['section', 'groups', 'group', 'wrapper'] as const;

function input(component: string, componentProps?: Record<string, unknown>) {
  return { type: INPUT_TYPES[component], 'x-component': component, ...(componentProps ? { 'x-component-props': componentProps } : {}) };
}

interface FormParts {
  /** The input rendered inside the FormField; leave out for an empty group. */
  field?: Record<string, unknown>;
  /** Extra schema keys for each level of the tree. */
  section?: Record<string, unknown>;
  groups?: Record<string, unknown>;
  group?: Record<string, unknown>;
  wrapper?: Record<string, unknown>;
  title?: Record<string, unknown>;
  /** Deepest level that is rendered; the levels below it get no properties. */
  depth?: typeof LEVELS[number];
}

function form({ field, section = {}, groups = {}, group = {}, wrapper = {}, title, depth = 'wrapper' }: FormParts): FormSchema {
  const level = LEVELS.indexOf(depth);
  return {
    $id: 'forged-vnode-form', type: 'object', 'x-component': 'FormContainer', properties: {
      section: {
        type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 }, ...section,
        properties: {
          ...(title ? { title: { type: 'object', 'x-component': 'FormSectionTitle', ...title } } : {}),
          ...(level < 1 ? {} : {
            groups: {
              type: 'object', 'x-component': 'FormSectionGroupContainer', ...groups,
              properties: level < 2 ? {} : {
                group: {
                  type: 'object', 'x-component': 'FormSectionGroup', ...group,
                  properties: level < 3 || !field ? {} : {
                    target: { type: 'object', 'x-component': 'FormField', 'x-ui': { order: 1 }, ...wrapper, properties: { target: field } },
                  },
                },
              },
            },
          }),
        },
      },
    },
  } as unknown as FormSchema;
}

// The meta-schema rejects some of the payloads (a `label` typed as string, for
// example). Those render the validation error instead of the form, which is a
// safe outcome too, so `accepted` tells the two apart.
function render(schema: FormSchema, { mustBeAccepted = true } = {}) {
  const container = document.createElement('div');
  // A render error would be thrown here.
  createFormFactory({ schema, container });
  const accepted = container.querySelector('form') !== null;
  if (mustBeAccepted) expect(accepted).toBe(true);
  return { container, accepted };
}

function expectNoInjection({ container }: ReturnType<typeof render>) {
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('[onerror]')).toBeNull();
  expect(container.querySelector('a')).toBeNull();
  expect(container.innerHTML).not.toContain('onerror');
  expect(container.innerHTML).not.toContain('javascript:');
  if (container.querySelector('form')) expect(container.textContent).not.toContain('[object Object]');
}

function labelTexts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('label')).map((label) => label.textContent);
}

describe('forged elements in schema values (V1)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  for (const component of INPUTS) {
    it(`payload A: renders a forged ${component} label as empty text`, () => {
      for (const forged of FORGED_VNODES) {
        const result = render(
          form({ field: input(component, { label: forged }) }),
          { mustBeAccepted: META_SCHEMA_ACCEPTS_OBJECT_LABEL.includes(component) },
        );

        expectNoInjection(result);
        if (result.accepted) {
          expect(result.container.querySelector('[data-test-id="target"]')).not.toBeNull();
          expect(labelTexts(result.container).every((text) => text === '')).toBe(true);
        }
      }
    });
  }

  for (const component of ['InputSelect', 'InputAutocomplete']) {
    it(`payload B: renders a forged ${component} option label as empty text`, () => {
      for (const forged of FORGED_VNODES) {
        const result = render(form({
          field: input(component, { label: 'L', options: [{ value: 'a', label: forged }, { value: 'b', label: 'B' }] }),
        }));

        expectNoInjection(result);
        expect(labelTexts(result.container)).toEqual(['L']);
        expect(result.container.querySelector('option[value="a"]')?.textContent).toBe('');
        expect(result.container.querySelector('option[value="b"]')?.textContent).toBe('B');
      }
    });
  }

  it('payload B: falls back to the default text for a forged InputSelect placeholder', () => {
    for (const forged of FORGED_VNODES) {
      // The meta-schema types `placeholder`, so the payload is inherited from a parent here.
      const result = render(form({ group: { 'x-component-props': { placeholder: forged } }, field: input('InputSelect') }));

      expectNoInjection(result);
      expect(result.container.querySelector('option[value=""]')?.textContent).toBe('Select...');
    }
  });

  for (const level of ['section', 'groups', 'group'] as const) {
    it(`payload C: never renders schema children of an empty ${level}`, () => {
      for (const children of [[FORGED_IMG], [FORGED_REACT_ELEMENT], FORGED_IMG, 'schema text', ['schema text'], 7]) {
        const result = render(form({ depth: level, [level]: { 'x-component-props': { children } } }));

        expectNoInjection(result);
        expect(result.container.textContent).not.toContain('schema text');
      }
    });
  }

  for (const level of LEVELS) {
    it(`payload C: schema children of the ${level} do not replace or join the rendered properties`, () => {
      for (const children of [[FORGED_IMG], [FORGED_REACT_ELEMENT], FORGED_IMG, 'schema text', ['schema text'], [{ type: 'img' }], [{ element: 'img' }]]) {
        const result = render(form({
          [level]: { 'x-component-props': { children } },
          field: input('InputTextarea', { label: 'Name', children }),
        }));

        expectNoInjection(result);
        expect(result.container.textContent).not.toContain('schema text');
        expect(labelTexts(result.container)).toEqual(['Name']);
        expect(result.container.querySelector('textarea[data-test-id="target"]')).not.toBeNull();
      }
    });
  }

  for (const component of ['InputText', 'InputCheckbox']) {
    it(`payload D: renders a forged label inherited by ${component} from a parent as empty text`, () => {
      for (const forged of FORGED_VNODES) {
        for (const level of LEVELS) {
          const result = render(form({ [level]: { 'x-component-props': { label: forged } }, field: input(component) }));

          expectNoInjection(result);
          expect(result.container.querySelector('[data-test-id="target"]')).not.toBeNull();
          expect(labelTexts(result.container).every((text) => text === '')).toBe(true);
        }
      }
    });
  }

  it('payload E: renders a forged section title as empty text', () => {
    for (const forged of FORGED_VNODES) {
      for (const componentProps of [{ 'x-content': forged }, { title: forged }, { children: [forged] }]) {
        const result = render(form({ depth: 'section', title: { 'x-content': 'T', 'x-component-props': componentProps } }));

        expectNoInjection(result);
        expect(result.container.querySelector('h3')?.textContent).toBe('x-content' in componentProps ? '' : 'T');
      }
      // The meta-schema types `x-content`, so this one must not get past validation.
      const rejected = render(form({ depth: 'section', title: { 'x-content': forged } }), { mustBeAccepted: false });
      expectNoInjection(rejected);
      expect(rejected.accepted).toBe(false);
    }
  });

  it('keeps legitimate text and nested content', () => {
    const { container } = render(form({
      title: { 'x-content': 'Personal data' },
      field: input('InputSelect', { label: 'Country', placeholder: 'Pick one', options: [{ value: 'br', label: 'Brazil' }] }),
    }));

    expect(container.querySelector('h3')?.textContent).toBe('Personal data');
    expect(labelTexts(container)).toEqual(['Country']);
    expect(container.querySelector('option[value=""]')?.textContent).toBe('Pick one');
    expect(container.querySelector('option[value="br"]')?.textContent).toBe('Brazil');
  });
});
