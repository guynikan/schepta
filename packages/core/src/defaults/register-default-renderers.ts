import { ComponentSpec, ComponentType, RuntimeAdapter } from "../runtime/types";

/**
 * Renderer function - wraps component rendering with additional logic
 */
export type RendererFn = (
    componentSpec: ComponentSpec,
    props: Record<string, any>,
    runtime: RuntimeAdapter,
    children?: any[]
) => any;

/**
 * Default renderers - pass props as is
 */
export const defaultRenderers: Record<ComponentType, RendererFn> = {
    field: (spec, props, runtime, children) => {
        const propsWithChildren = children && children.length > 0
            ? { ...props, children }
            : props;
        return runtime.create(spec, propsWithChildren);
    },
    button: (spec, props, runtime, children) => {
        const propsWithChildren = children && children.length > 0
            ? { ...props, children }
            : props;
        return runtime.create(spec, propsWithChildren);
    },
    'container': (spec, props, runtime, children) => {
        return runtime.create(spec, { ...props, children });
    },
    content: (spec, props, runtime, children) => {
        const propsWithChildren = children && children.length > 0
            ? { ...props, children }
            : props;
        return runtime.create(spec, propsWithChildren);
    },
    addon: (spec, props, runtime) => {
        return runtime.create(spec, props);
    },
    'menu-item': (spec, props, runtime, children) => {
        const propsWithChildren = children && children.length > 0
            ? { ...props, children }
            : props;
        return runtime.create(spec, propsWithChildren);
    },
    'menu-container': (spec, props, runtime, children) => {
        const propsWithChildren = children && children.length > 0
            ? { ...props, children }
            : props;
        return runtime.create(spec, propsWithChildren);
    },
}