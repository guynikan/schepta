/**
 * Vue Form Renderer
 */

import { defineComponent } from 'vue';
import type { FormSchema } from '@schepta/core';

export interface FormRendererProps {
  componentKey: string;
  schema: any;
  renderer: (componentKey: string, schema: any, parentProps?: Record<string, any>) => any;
  onSubmit?: () => void;
}

export const FormRenderer = defineComponent({
  name: 'FormRenderer',
  props: {
    componentKey: String,
    schema: Object,
    renderer: Function,
    onSubmit: Function,
  },
  setup(props: FormRendererProps) {
    return () => {
      try {
        // The orchestrator handles recursive rendering of children
        const result = props.renderer(props.componentKey, props.schema);
        
        // If renderer returns null or undefined, return null
        if (!result) {
          console.error('[FormRenderer] Renderer returned null/undefined for', props.componentKey, {
            schema: props.schema,
            componentKey: props.componentKey,
          });
          return null;
        }
        
        // Return the VNode directly
        return result;
      } catch (error) {
        console.error('[FormRenderer] Error rendering:', error);
        return null;
      }
    };
  },
});

