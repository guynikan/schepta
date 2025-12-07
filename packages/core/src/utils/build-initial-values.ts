/**
 * Build Initial Values from Schema
 * 
 * Extracts default values from form schema structure.
 */

import type { FormSchema } from '../schema/schema-types';

/**
 * Build initial values for form fields from a FormSchema.
 * This utility extracts default values based on the component type
 * defined in the schema structure.
 */
export function buildInitialValuesFromSchema(schema: FormSchema): Record<string, any> {
  const initialValues: Record<string, any> = {};

  const resolveFields = (props: any) => {
    if (!props || typeof props !== 'object') return;
    
    for (const sectionKey in props) {
      const section = props[sectionKey];
      if (!section?.properties) continue;

      for (const groupKey in section.properties) {
        const group = section.properties[groupKey];
        if (!group?.properties) continue;

        for (const fieldKey in group.properties) {
          const field = group.properties[fieldKey];
          const component = field?.['x-component'];

          if (!component) continue;

          initialValues[fieldKey] = getDefaultValueForComponent(component);
        }
      }
    }
  };

  resolveFields(schema.properties);
  return initialValues;
}

/**
 * Get default value for a component type.
 * This maps component types to their appropriate default values.
 */
function getDefaultValueForComponent(component: string): any {
  switch (component) {
    case 'InputCheckbox':
      return false;
    case 'InputText':
    case 'InputCpf':
    case 'InputPhone':
    case 'DatePicker':
    case 'InputAutocomplete':
      return '';
    case 'SelectMultiple':
      return [];
    case 'InputSelect':
      return '';
    default:
      return undefined;
  }
}

