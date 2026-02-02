import { createRendererSpec } from "@schepta/core";
import { DefaultFieldRenderer } from "../renderers/DefaultFieldRenderer";

export const defaultRenderers = {
    field: createRendererSpec({
        id: 'field',
        type: 'field',
        component: () => DefaultFieldRenderer as any,
    }),
}