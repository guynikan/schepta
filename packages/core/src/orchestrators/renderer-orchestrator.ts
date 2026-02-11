/**
 * Renderer Orchestrator
 * 
 * Orchestrates the rendering of a renderer component.
 * 
 */

import type { ComponentSpec, RuntimeAdapter, RendererSpec } from '../runtime/types';

export function createRendererOrchestrator(
    rendererSpec: RendererSpec,
) {
    return function render(
        componentSpec: ComponentSpec,
        props: Record<string, any>,
        runtime: RuntimeAdapter,
        children?: any[]
    ) {
        // Extract name from props
        const name = props.name || '';

        // If this is a field component and we have a name, use the renderer component
        if (name && componentSpec.type === 'field') {
            const Component = componentSpec.component(props, runtime);

            const xComponentProps = props['x-component-props'] || {};

            const componentProps = {
                ...xComponentProps,
                name, // Ensure name is passed
                ...(props.externalContext ? { externalContext: props.externalContext } : {}),
                ...(props.schema ? { schema: props.schema } : {}),
                ...(props.componentKey ? { componentKey: props.componentKey } : {}),
                ...(props['data-test-id'] ? { 'data-test-id': props['data-test-id'] } : {}),
            };
            return runtime.create(rendererSpec, {
                name,
                component: Component as any,
                componentProps,
                children,
            });
        }

        // For non-field components or fields without name, use default rendering
        const xComponentProps = props['x-component-props'] || {};
        const mergedProps = { ...props, ...xComponentProps };

        const propsWithChildren =
            children && children.length > 0
                ? { ...mergedProps, children }
                : mergedProps;

        return runtime.create(componentSpec, propsWithChildren);
    }
}