import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { FormFactory } from './form-factory';
import type { FormSchema } from '@schepta/core';
import complexForm from '../../../../instances/form/complex-form.json';

// Vue has no Symbol guard on VNodes, so plain JSON can forge one.
const FORGED_IMG = { __v_isVNode: true, type: 'img', props: { src: 'x', onerror: 'alert(document.domain)' }, shapeFlag: 1 };
const FORGED_HTML = { __v_isVNode: true, type: 'div', props: { innerHTML: '<img src=x onerror=alert(1)>' }, shapeFlag: 1 };
const FORGED_LINK = { __v_isVNode: true, type: 'a', props: { href: 'javascript:alert(3)' }, shapeFlag: 9, children: 'click' };
const FORGED_VNODES = [FORGED_IMG, FORGED_HTML, FORGED_LINK];

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
  const wrapper = mount(FormFactory, { props: { schema } });
  const accepted = wrapper.find('form').exists();
  if (mustBeAccepted) expect(accepted).toBe(true);
  return Object.assign(wrapper, { accepted });
}

function expectNoInjection(wrapper: ReturnType<typeof render>) {
  const html = wrapper.html();
  expect(wrapper.find('img').exists()).toBe(false);
  expect(wrapper.find('[onerror]').exists()).toBe(false);
  expect(wrapper.find('a').exists()).toBe(false);
  expect(html).not.toContain('onerror');
  expect(html).not.toContain('javascript:');
  expect(html).not.toContain('alert(');
  expect(wrapper.text()).not.toContain('[object Object]');
}

describe('forged VNodes in schema values (V1)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('control: Vue mounts a forged VNode placed in child position', () => {
    const wrapper = mount({ render: () => h('label', null, FORGED_IMG as any) });
    expect(wrapper.find('img').attributes('onerror')).toBe('alert(document.domain)');
  });

  it('control: an HTML string in a label is rendered as text', () => {
    const wrapper = render(form({ field: input('InputText', { label: '<img src=x onerror=alert(1)>' }) }));
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('label').text()).toBe('<img src=x onerror=alert(1)>');
  });

  for (const component of INPUTS) {
    it(`payload A: does not mount a forged VNode used as the ${component} label`, () => {
      for (const forged of FORGED_VNODES) {
        const wrapper = render(
          form({ field: input(component, { label: forged }) }),
          { mustBeAccepted: META_SCHEMA_ACCEPTS_OBJECT_LABEL.includes(component) },
        );

        expectNoInjection(wrapper);
        if (wrapper.accepted) {
          expect(wrapper.find('[data-test-id="section.target"]').exists()).toBe(true);
          expect(wrapper.findAll('label').every((label) => label.text() === '')).toBe(true);
        }
      }
    });
  }

  for (const component of ['InputSelect', 'InputAutocomplete']) {
    it(`payload B: does not mount a forged VNode used as an ${component} option label`, () => {
      for (const forged of FORGED_VNODES) {
        const wrapper = render(form({
          field: input(component, { label: 'L', options: [{ value: 'a', label: forged }, { value: 'b', label: 'B' }] }),
        }));

        expectNoInjection(wrapper);
        expect(wrapper.find('label').text()).toBe('L');
        expect(wrapper.find('option[value="a"]').text()).toBe('');
        expect(wrapper.find('option[value="b"]').text()).toBe('B');
      }
    });
  }

  it('payload B: does not mount a forged VNode used as the InputSelect placeholder', () => {
    for (const forged of FORGED_VNODES) {
      // The meta-schema types `placeholder`, so the payload is inherited from a parent here.
      const wrapper = render(form({ group: { 'x-component-props': { placeholder: forged } }, field: input('InputSelect') }));

      expectNoInjection(wrapper);
      expect(wrapper.find('option[value=""]').text()).toBe('');
    }
  });

  for (const level of ['section', 'groups', 'group'] as const) {
    it(`payload C: never renders schema children of an empty ${level}`, () => {
      for (const forged of FORGED_VNODES) {
        const wrapper = render(form({
          depth: level,
          [level]: { 'x-component-props': { children: [forged], 'data-test-id': 'forged-target' } },
        }));

        expectNoInjection(wrapper);
        expect(wrapper.find('[data-test-id="forged-target"]').element.childNodes.length).toBe(0);
      }
    });
  }

  for (const level of LEVELS) {
    it(`payload C: schema children of the ${level} do not replace or join the rendered properties`, () => {
      for (const children of [[FORGED_IMG], [FORGED_HTML], [FORGED_LINK], FORGED_IMG, 'schema text', ['schema text'], [{ type: 'img' }]]) {
        const wrapper = render(form({
          [level]: { 'x-component-props': { children } },
          field: input('InputTextarea', { label: 'Name', children }),
        }));

        expectNoInjection(wrapper);
        expect(wrapper.text()).not.toContain('schema text');
        expect(wrapper.find('label').text()).toBe('Name');
        expect(wrapper.find('textarea[data-test-id="section.target"]').exists()).toBe(true);
      }
    });
  }

  for (const component of ['InputText', 'InputCheckbox']) {
    it(`payload D: does not mount a forged label inherited by ${component} from a parent`, () => {
      for (const forged of FORGED_VNODES) {
        for (const level of LEVELS) {
          const wrapper = render(form({ [level]: { 'x-component-props': { label: forged } }, field: input(component) }));

          expectNoInjection(wrapper);
          expect(wrapper.find('[data-test-id="section.target"]').exists()).toBe(true);
          expect(wrapper.findAll('label').every((label) => label.text() === '')).toBe(true);
        }
      }
    });
  }

  it('payload E: does not mount a forged VNode used as the section title', () => {
    for (const forged of FORGED_VNODES) {
      for (const componentProps of [{ xContent: forged }, { 'x-content': forged }, { children: [forged] }]) {
        const wrapper = render(form({ depth: 'section', title: { 'x-content': 'T', 'x-component-props': componentProps } }));

        expectNoInjection(wrapper);
        expect(wrapper.find('h2').text()).toBe('children' in componentProps ? 'T' : '');
      }
      // The meta-schema types `x-content`, so this one must not get past validation.
      const rejected = render(form({ depth: 'section', title: { 'x-content': forged } }), { mustBeAccepted: false });
      expectNoInjection(rejected);
      expect(rejected.accepted).toBe(false);
    }
  });

  it('keeps legitimate text and nested content', () => {
    const wrapper = render(form({
      title: { 'x-content': 'Personal data' },
      field: input('InputSelect', { label: 'Country', placeholder: 'Pick one', options: [{ value: 'br', label: 'Brazil' }] }),
    }));

    expect(wrapper.find('h2').text()).toBe('Personal data');
    expect(wrapper.find('label').text()).toBe('Country');
    expect(wrapper.find('option[value=""]').text()).toBe('Pick one');
    expect(wrapper.find('option[value="br"]').text()).toBe('Brazil');
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('FormSectionGroup columns (O4)', () => {
  function gridTemplate(columns: unknown) {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = render(form({
      group: { 'x-component-props': { columns, 'data-test-id': 'group' } },
      field: input('InputText'),
    }));
    const style = (wrapper.find('[data-test-id="group"]').element as HTMLElement).style;
    warn.mockRestore();
    return { display: style.display, gridTemplateColumns: style.gridTemplateColumns };
  }

  it('turns columns into the grid template', () => {
    expect(gridTemplate('1fr 1fr')).toEqual({ display: 'grid', gridTemplateColumns: '1fr 1fr' });
    expect(gridTemplate('repeat(2, 1fr)')).toEqual({ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' });
  });

  it('falls back to the default template without columns or with an unsafe value', () => {
    const fallback = 'repeat(auto-fit, minmax(200px, 1fr))';
    expect(gridTemplate(undefined).gridTemplateColumns).toBe(fallback);
    expect(gridTemplate('url(https://attacker.example/x.png)').gridTemplateColumns).toBe(fallback);
    expect(gridTemplate({ toString: () => '1fr' }).gridTemplateColumns).toBe(fallback);
  });

  it('renders the complex-form instance, which uses repeat() columns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = render(complexForm as unknown as FormSchema);

    expect(wrapper.html()).toContain('grid-template-columns: repeat(2, 1fr)');
    expect(warn.mock.calls.filter(([message]) => String(message).includes('[Schepta] Dropped'))).toEqual([]);
    warn.mockRestore();
  });
});
