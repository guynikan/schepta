import { describe, expect, it } from 'vitest';
import {
  acceptUiSpec,
  acceptCorrectedUiSpec,
  canonicalizeUiSpec,
  createSemanticCatalog,
  repairUiSpec,
  stringifyCanonicalUiSpec,
  validateUiInputs,
  validateSemanticCatalog,
  validateUiSpec,
  reactMuiCatalog,
} from './index';
import type { SemanticCatalog, UiSpec } from './types';

const catalog: SemanticCatalog = createSemanticCatalog({
  components: {
    Stack: {
      description: 'A semantic layout container',
      slots: { content: { multiple: true } },
    },
    TextInput: {
      propsSchema: {
        type: 'object',
        properties: { label: { type: 'string' }, required: { type: 'boolean' } },
        additionalProperties: false,
      },
    },
    Button: { capabilities: ['interactive'] },
  },
  actions: {
    submit: {
      description: 'Submit the current form',
      argsSchema: {
        type: 'object',
        properties: { intent: { type: 'string' } },
        required: ['intent'],
        additionalProperties: false,
      },
      capabilities: ['interactive'],
    },
  },
});

function validSpec(): UiSpec {
  return {
    version: '1.0',
    root: 'root',
    elements: {
      root: {
        component: 'Stack',
        slots: { content: ['name', 'submit'] },
      },
      name: {
        component: 'TextInput',
        props: { label: 'Name', required: true },
        bindings: { value: 'nameValue' },
      },
      submit: {
        component: 'Button',
        actions: { press: 'submitInvocation' },
      },
    },
    state: {
      name: { schema: { type: 'string' }, initial: '' },
    },
    bindings: {
      nameValue: { path: 'state.name', mode: 'twoWay' },
    },
    actions: {
      submitInvocation: { action: 'submit', args: { intent: 'save' } },
    },
  };
}

describe('semantic Generative UI core', () => {
  it('accepts a valid versioned spec and renderer capabilities', () => {
    const report = validateUiSpec(validSpec(), {
      catalog,
      rendererCapabilities: {
        components: ['Stack', 'TextInput', 'Button'],
        actions: ['submit'],
        capabilities: ['interactive'],
      },
    });

    expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
  });

  it('validates catalog schemas before they are used', () => {
    const report = validateSemanticCatalog({
      components: { Text: { propsSchema: { type: 'not-a-json-schema-type' } } },
      actions: {},
    });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.code === 'invalid-schema')).toBe(true);
  });

  it('rejects an unknown component', () => {
    const spec = validSpec();
    spec.elements.name.component = 'UnknownComponent';
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.code === 'unknown-component')).toBe(true);
    expect(report.errors.some((error) => error.path === '/elements/name/component')).toBe(true);
  });

  it('rejects props that do not match the component schema', () => {
    const spec = validSpec();
    spec.elements.name.props = { label: 42 } as never;
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.code === 'props-type')).toBe(true);
  });

  it('rejects an action that is not catalogued', () => {
    const spec = validSpec();
    spec.actions!.submitInvocation.action = 'deleteAllData';
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.code === 'unknown-action')).toBe(true);
  });

  it('rejects invalid action inputs', () => {
    const spec = validSpec();
    spec.actions!.submitInvocation.args = { intent: 123 } as never;
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.path === '/actions/submitInvocation/args/intent')).toBe(true);
  });

  it('rejects cyclic element trees', () => {
    const spec = validSpec();
    spec.elements.root.children = ['name'];
    spec.elements.name.children = ['root'];
    delete spec.elements.root.slots;
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.code === 'cyclic-elements')).toBe(true);
  });

  it('validates arbitrary inputs without executing values', () => {
    const report = validateUiInputs(
      { page: 'first', count: 0 },
      {
        type: 'object',
        properties: { page: { type: 'string' }, count: { type: 'integer', minimum: 1 } },
        required: ['page', 'count'],
      },
    );

    expect(report.valid).toBe(false);
    expect(report.errors[0].path).toBe('/inputs/count');
  });

  it('canonicalizes keys stably without changing array order or input data', () => {
    const spec = validSpec();
    const before = JSON.stringify(spec);
    const first = stringifyCanonicalUiSpec(spec);
    const second = stringifyCanonicalUiSpec(canonicalizeUiSpec(spec));

    expect(first).toBe(second);
    expect(JSON.stringify(spec)).toBe(before);
    expect(first.indexOf('"actions"')).toBeLessThan(first.indexOf('"elements"'));
  });

  it('accepts only canonical, validated JSON specs', () => {
    const result = acceptUiSpec(validSpec(), { catalog });
    expect(result.accepted).toBe(true);
    expect(result.spec).toBeDefined();
    expect(stringifyCanonicalUiSpec(result.spec!)).toBe(stringifyCanonicalUiSpec(validSpec()));
  });

  it('rejects unsafe values without executing or silently dropping them', () => {
    const spec = validSpec() as unknown as Record<string, unknown>;
    spec.metadata = { callback: () => 'must never run' };
    const result = acceptUiSpec(spec, { catalog });

    expect(result.accepted).toBe(false);
    expect(result.report.errors.some((error) => error.code === 'unsafe-input')).toBe(true);
  });

  it('limits repair to explicit bounded operations', () => {
    const spec = validSpec() as unknown as Record<string, unknown>;
    spec.untrusted = 'remove me';
    const result = repairUiSpec(spec, {
      catalog,
      operations: ['removeUnknownProperties', 'canonicalize'],
      maxChanges: 2,
    });

    expect(result.accepted).toBe(true);
    expect(result.changes).toHaveLength(2);
    expect(result.spec).toBeDefined();
  });

  it('accepts only an initial candidate plus two error-guided corrections', () => {
    const rejected = { version: '1.0', root: 'root', elements: { root: { component: 'Unknown' } } };
    const result = acceptCorrectedUiSpec([rejected, rejected, rejected, validSpec()], { catalog });

    expect(result.accepted).toBeUndefined();
    expect(result.attempts).toHaveLength(3);
    expect(result.attempts[0].report.errors[0].code).toBe('unknown-component');
  });

  it('rejects a naturally unavailable built-in component with a structured error', () => {
    const report = validateUiSpec({ version: '1.0', root: 'date', elements: { date: { component: 'DatePicker' } } }, { catalog: reactMuiCatalog });

    expect(report.valid).toBe(false);
    expect(report.errors).toContainEqual(expect.objectContaining({ code: 'unknown-component', path: '/elements/date/component' }));
  });

  it('rejects unknown state properties with a structured error', () => {
    const spec = validSpec();
    (spec.state!.name as Record<string, unknown>).unexpected = true;
    const report = validateUiSpec(spec, { catalog });

    expect(report.valid).toBe(false);
    expect(report.errors).toContainEqual(expect.objectContaining({ code: 'unknown-state-property', path: '/state/name/unexpected' }));
  });
});
