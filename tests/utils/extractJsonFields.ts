import type { FormSchema } from '@schepta/core';

function isInputComponent(component: string): boolean {
  return component.startsWith('Input') ||
    component === 'InputText' ||
    component === 'InputSelect' ||
    component === 'InputPhone' ||
    component === 'InputDate' ||
    component === 'InputTextarea' ||
    component === 'InputNumber' ||
    component === 'InputCheckbox';
}

/**
 * Recursively extracts all form field names from a schema JSON
 * A field is identified by having x-component: "FormField" and containing
 * a property with an input component (InputText, InputSelect, etc.)
 */
export function extractFormFields(schema: FormSchema | any): string[] {
  const fields: string[] = [];

  function traverse(obj: any, path: string[] = []) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Check if this is a FormField component
    if (obj['x-component'] === 'FormField' && obj.properties) {
      // Look for the actual input field inside the FormField
      for (const [key, value] of Object.entries(obj.properties)) {
        if (value && typeof value === 'object' && 'x-component' in value) {
          const component = (value as any)['x-component'];
          // Check if it's an input component
          if (component && isInputComponent(component)) {
            fields.push(key);
          }
        }
      }
    }

    // Recursively traverse properties
    if (obj.properties) {
      for (const [key, value] of Object.entries(obj.properties)) {
        if (value && typeof value === 'object') {
          traverse(value, [...path, key]);
        }
      }
    }
  }

  traverse(schema);
  return fields;
}

/**
 * Extracts required fields from schema based on x-rules.required or required prop
 */
export function extractRequiredFields(schema: FormSchema | any): string[] {
  const requiredFields: string[] = [];

  function traverse(obj: any, currentFieldName: string | null = null) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Check if this is an input component with required validation
    if (obj['x-component'] && (
      isInputComponent(obj['x-component'])
    )) {
      // Check for required in x-rules or x-component-props
      const isRequired = 
        obj['x-component-props']?.required === true;
      
      if (isRequired && currentFieldName) {
        requiredFields.push(currentFieldName);
      }
    }

    // Recursively traverse properties
    if (obj.properties) {
      for (const [key, value] of Object.entries(obj.properties)) {
        if (value && typeof value === 'object') {
          // Use the key as field name if we're inside a FormField
          const fieldName = obj['x-component'] === 'FormField' ? key : currentFieldName;
          traverse(value, fieldName);
        }
      }
    }
  }

  traverse(schema);
  return requiredFields;
}