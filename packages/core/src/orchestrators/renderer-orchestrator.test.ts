import { describe, expect, it, vi } from 'vitest';
import { createRendererOrchestrator } from './renderer-orchestrator';
import type { ComponentSpec, RendererSpec, RuntimeAdapter } from '../runtime/types';

const forgedVNode = { __v_isVNode: true, type: 'img', props: { src: 'x', onerror: 'alert(1)' }, shapeFlag: 1 };

function createRuntime() {
  const create = vi.fn((_spec: unknown, props: Record<string, any>) => props);
  return { runtime: { create } as unknown as RuntimeAdapter, create };
}

const containerSpec = { id: 'Container', type: 'container', component: () => 'div' } as unknown as ComponentSpec;
const fieldSpec = { id: 'InputText', type: 'field', component: () => 'input' } as unknown as ComponentSpec;
const rendererSpec = { id: 'field-renderer', type: 'field', component: () => 'renderer' } as unknown as RendererSpec;

describe('createRendererOrchestrator', () => {
  it('never passes schema-supplied children to a container', () => {
    const { runtime, create } = createRuntime();
    const render = createRendererOrchestrator(rendererSpec);

    render(containerSpec, {
      children: [forgedVNode],
      'x-component-props': { children: [forgedVNode], title: 'kept', 'x-component-props': { children: [forgedVNode] } },
      'x-ui': { order: 1, children: [forgedVNode] },
    }, runtime);

    const props = create.mock.calls[0][1];
    expect('children' in props).toBe(false);
    expect(props.title).toBe('kept');
    expect(props['x-component-props']).toEqual({});
    expect(props['x-ui']).toEqual({ order: 1 });
    expect(JSON.stringify(props)).not.toContain('__v_isVNode');
  });

  it('passes only the orchestrator children to a container', () => {
    const { runtime, create } = createRuntime();
    const render = createRendererOrchestrator(rendererSpec);
    const orchestratorChildren = [{ rendered: 'child' }];

    render(containerSpec, { 'x-component-props': { children: [forgedVNode] } }, runtime, orchestratorChildren);

    expect(create.mock.calls[0][1].children).toBe(orchestratorChildren);
  });

  it('never passes schema-supplied children to a field', () => {
    const { runtime, create } = createRuntime();
    const render = createRendererOrchestrator(rendererSpec);

    render(fieldSpec, {
      name: 'email',
      children: [forgedVNode],
      'x-component-props': { label: 'Email', children: [forgedVNode] },
    }, runtime);

    const props = create.mock.calls[0][1];
    expect(props.children).toBeUndefined();
    expect(props.componentProps).toEqual({ label: 'Email', name: 'email' });
  });

  it('leaves props without children untouched', () => {
    const { runtime, create } = createRuntime();
    const render = createRendererOrchestrator(rendererSpec);
    const xComponentProps = { variant: 'outlined' };
    const xUi = { order: 1 };

    render(containerSpec, { 'x-component-props': xComponentProps, 'x-ui': xUi, externalContext: { user: 'u' } }, runtime);

    const props = create.mock.calls[0][1];
    expect(props['x-component-props']).toBe(xComponentProps);
    expect(props['x-ui']).toBe(xUi);
    expect(props.variant).toBe('outlined');
  });
});
