/**
 * Vue Form Renderer
 */

import { defineComponent } from 'vue';
import type { FormSchema } from '@spectra/core';

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
      const result = props.renderer(props.componentKey, props.schema);
      
      if (!result) {
        return null;
      }

      // Handle children if schema has properties
      if (props.schema.properties && typeof props.schema.properties === 'object') {
        const children: any[] = [];
        
        for (const [key, childSchema] of Object.entries(props.schema.properties)) {
          const childResult = props.renderer(key, childSchema as any);
          if (childResult) {
            children.push(childResult);
          }
        }

        if (children.length > 0 && result.children) {
          return { ...result, children };
        }
      }

      return result;
    };
  },
});

