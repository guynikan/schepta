import type { ComponentSpec, RuntimeAdapter, RendererSpec, RenderResult } from '../runtime/types';
import { createComponentSpec } from '../registries/component-registry';
import { createRendererSpec } from '../registries/renderer-registry';

/**
 * Generate a valid Schepta FormSchema with N fields for benchmarking.
 * @param numFields Total input fields
 * @param numTemplates How many fields should contain {{ }} expressions
 */
export function createBenchSchema(numFields: number, numTemplates: number = 0): any {
  const fieldEntries: Record<string, any> = {};

  for (let i = 0; i < numFields; i++) {
    const hasTemplate = i < numTemplates;
    fieldEntries[`field_${i}`] = {
      type: 'object',
      'x-component': 'FormField',
      'x-ui': { order: i + 1 },
      properties: {
        [`input_${i}`]: {
          type: 'string',
          'x-component': 'InputText',
          'x-component-props': {
            label: hasTemplate
              ? `Label {{ $formValues.section1.input_0 }}`
              : `Field ${i}`,
            placeholder: hasTemplate
              ? `{{ $externalContext.placeholders.field_${i} }}`
              : `Enter field ${i}`,
          },
        },
      },
    };
  }

  return {
    $id: 'bench-form',
    type: 'object',
    'x-component': 'FormContainer',
    properties: {
      section1: {
        type: 'object',
        'x-component': 'FormSectionContainer',
        'x-ui': { order: 1 },
        properties: {
          title: {
            type: 'object',
            'x-component': 'FormSectionTitle',
            'x-content': 'Bench Section',
          },
          fields: {
            type: 'object',
            'x-component': 'FormSectionGroupContainer',
            properties: {
              row1: {
                type: 'object',
                'x-component': 'FormSectionGroup',
                properties: fieldEntries,
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Generate form values matching a bench schema.
 */
export function createBenchFormValues(numFields: number): Record<string, any> {
  const values: Record<string, any> = {};
  for (let i = 0; i < numFields; i++) {
    values[`input_${i}`] = `value_${i}`;
  }
  return { section1: values };
}

/**
 * A no-op RuntimeAdapter for benchmarking the core without a real framework.
 */
export class NoopRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec | RendererSpec, props: Record<string, any>): RenderResult {
    return { type: spec.id, props };
  }
  fragment(children: RenderResult[]): RenderResult {
    return { type: 'fragment', children };
  }
  isValidElement(_value: unknown): boolean {
    return true;
  }
  getChildren(element: RenderResult): RenderResult[] {
    return (element as any)?.children || [];
  }
  setProps(element: RenderResult, props: Record<string, any>): void {
    Object.assign((element as any).props || {}, props);
  }
}

/**
 * Create a minimal set of ComponentSpecs for benchmarking.
 */
export function createBenchComponents(): Record<string, ComponentSpec> {
  const noopFactory = () => 'div';
  return {
    FormContainer: createComponentSpec({ id: 'FormContainer', type: 'container', component: noopFactory }),
    FormSectionContainer: createComponentSpec({ id: 'FormSectionContainer', type: 'container', component: noopFactory }),
    FormSectionTitle: createComponentSpec({ id: 'FormSectionTitle', type: 'content', component: noopFactory }),
    FormSectionGroupContainer: createComponentSpec({ id: 'FormSectionGroupContainer', type: 'container', component: noopFactory }),
    FormSectionGroup: createComponentSpec({ id: 'FormSectionGroup', type: 'container', component: noopFactory }),
    FormField: createComponentSpec({ id: 'FormField', type: 'container', component: noopFactory }),
    InputText: createComponentSpec({ id: 'InputText', type: 'field', component: noopFactory }),
    SubmitButton: createComponentSpec({ id: 'SubmitButton', type: 'button', component: noopFactory }),
  };
}

export function createBenchRenderers() {
  return {
    field: createRendererSpec({ id: 'field', type: 'field', component: () => 'div' }),
  };
}
