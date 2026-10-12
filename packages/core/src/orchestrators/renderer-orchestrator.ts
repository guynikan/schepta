/**
 * Renderer Orchestrator
 * 
 * Orchestrates the rendering of a renderer component.
 * 
 */

import type { ComponentSpec, RuntimeAdapter, RendererSpec } from '../runtime/types';
import { omitSchemaChildren } from '../utils/safe-text';

const SCHEMA_PROP_BAGS = ['x-component-props', 'x-ui'] as const;

/**
 * Removes every schema-supplied `children` value from the props: the top-level
 * key and the one inside the schema prop bags that travel with them (and are
 * inherited by child components). The only children a component may receive
 * are the ones the orchestrator renders from schema `properties`.
 */
function withoutSchemaChildren(props: Record<string, any>): Record<string, any> {
    const safeProps = omitSchemaChildren(props);
    let result = safeProps;

    for (const bag of SCHEMA_PROP_BAGS) {
        const safeBag = omitSchemaChildren(safeProps[bag]);
        if (safeBag !== safeProps[bag]) {
            result = { ...result, [bag]: safeBag };
        }
    }

    return result;
}

export function createRendererOrchestrator(
    rendererSpec: RendererSpec,
) {
    return function render(
        componentSpec: ComponentSpec,
        props: Record<string, any>,
        runtime: RuntimeAdapter,
        children?: any[]
    ) {
        props = withoutSchemaChildren(props);

        // Extract name from props
        const name = props.name || '';

        // If this is a field component and we have a name, use the renderer component
        if (name && componentSpec.type === 'field') {
            const Component = componentSpec.component(props, runtime);

            const xComponentProps = props['x-component-props'] || {};

            const componentProps = withoutSchemaChildren({
                ...xComponentProps,
                name, // Ensure name is passed
                ...(props.externalContext ? { externalContext: props.externalContext } : {}),
                ...(props.schema ? { schema: props.schema } : {}),
                ...(props.componentKey ? { componentKey: props.componentKey } : {}),
                ...(props['data-test-id'] ? { 'data-test-id': props['data-test-id'] } : {}),
            });
            return runtime.create(rendererSpec, {
                name,
                component: Component as any,
                componentProps,
                children,
            });
        }

        // For non-field components or fields without name, use default rendering.
        // The merge can surface a nested `x-component-props` bag, so the result
        // is cleaned again before the orchestrator children are attached.
        const xComponentProps = props['x-component-props'] || {};
        const mergedProps = withoutSchemaChildren({ ...props, ...xComponentProps });

        const propsWithChildren =
            children && children.length > 0
                ? { ...mergedProps, children }
                : mergedProps;

        return runtime.create(componentSpec, propsWithChildren);
    }
}