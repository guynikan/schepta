/**
 * Default Field Renderer for Vanilla
 *
 * Renders field components with native Schepta form adapter binding.
 */

import type { FormAdapter } from '@schepta/core';

export interface FieldRendererProps {
  name: string;
  component: (props: any) => HTMLElement;
  componentProps?: Record<string, any>;
  children?: any[];
}

/**
 * Helper to get nested value from object using dot notation path
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let value: any = obj;
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  return value;
}

/**
 * Create default field renderer with form adapter binding
 * 
 * This renderer:
 * 1. Gets current value from adapter
 * 2. Passes value and onChange handler to component
 * 3. Watches for adapter value changes and updates DOM
 * 
 * @param adapter Form adapter instance
 * @returns Field renderer function
 */
export function createDefaultFieldRenderer(
  adapter: FormAdapter
): (props: FieldRendererProps) => HTMLElement {
  return (props: FieldRendererProps): HTMLElement => {
    const { name, component, componentProps } = props;
    
    // Get current value from adapter
    const currentValue = adapter.getValue(name);
    
    // Create component with binding
    const element = component({
      ...componentProps,
      name,
      value: currentValue,
      onChange: (value: any) => {
        adapter.setValue(name, value);
      },
    });
    
    // Watch for value changes from adapter and update DOM
    const reactiveState = adapter.watch(name);
    reactiveState.watch((newValue) => {
      // Find input/select/textarea element and update its value
      const input = element.querySelector('input');
      const select = element.querySelector('select');
      const textarea = element.querySelector('textarea');
      
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = newValue === true || newValue === 'true';
        } else {
          input.value = newValue?.toString() || '';
        }
      } else if (select) {
        select.value = newValue?.toString() || '';
      } else if (textarea) {
        textarea.value = newValue?.toString() || '';
      }
    });
    
    return element;
  };
}
