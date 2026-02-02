/**
 * Schema Traversal Utilities
 * 
 * Shared utilities for traversing FormSchema structure and extracting field information.
 * Used by schema-parser, form-validator, and test utilities.
 */

import type { FormFieldProperties, FormSchema } from '../schema/schema-types';

/**
 * Represents a field node extracted from the schema
 */
export interface FieldNode {
  /** Custom flag from x-custom */
  custom: boolean;
  /** Field name (leaf key in the schema, e.g., 'firstName') */
  name: string;
  /** Full path to the field (e.g., 'personalInfo.firstName') */
  path: string;
  /** JSON Schema type (string, number, boolean) */
  type: 'string' | 'number' | 'boolean';
  /** Component name (InputText, InputSelect, etc.) */
  component: string;
  /** Label from x-component-props */
  label?: string;
  /** Visibility from x-ui.visible (default: true) */
  visible: boolean | string;
  /** All props from x-component-props */
  props: Record<string, any>;
}

type InputComponentTypes = NonNullable<FormFieldProperties[string]>;
type InputComponentNames = InputComponentTypes['x-component'];

/**
 * Input component names that represent form fields
 */

const INPUT_COMPONENTS: readonly InputComponentNames[] = [
  'InputText',
  'InputSelect',
  'InputPhone',
  'InputDate',
  'InputTextarea',
  'InputNumber',
  'InputCheckbox',
  'InputAutocomplete',
] as const;

/**
 * Components that are containers (not fields, but included in path)
 */
const CONTAINER_COMPONENTS = [
  'FormSectionContainer',
  'FormSectionGroupContainer',
  'FormSectionGroup',
  'FormField',
  'FormSectionTitle',
] as const;

/**
 * Check if a component name is an input component
 * 
 * @param component - Component name to check
 * @returns True if the component is an input type
 */
export function isInputComponent(component: string): boolean {
  return component.startsWith('Input') || 
    INPUT_COMPONENTS.includes(component as typeof INPUT_COMPONENTS[number]);
}

/**
 * Check if a component is a container that should be included in the path
 */
function isContainerComponent(component: string): boolean {
  return CONTAINER_COMPONENTS.includes(component as typeof CONTAINER_COMPONENTS[number]);
}

/**
 * Get the JSON Schema type for a component
 * 
 * @param component - Component name
 * @returns JSON Schema type
 */
export function getTypeForComponent(component: string): 'string' | 'number' | 'boolean' {
  switch (component) {
    case 'InputCheckbox':
      return 'boolean';
    case 'InputNumber':
      return 'number';
    default:
      return 'string';
  }
}

/**
 * Get default value for a component type
 * 
 * @param component - Component name
 * @returns Default value for the field
 */
export function getDefaultValueForComponent(component: string): any {
  switch (component) {
    case 'InputCheckbox':
      return false;
    case 'InputNumber':
      return undefined;
    case 'SelectMultiple':
      return [];
    case 'InputText':
    case 'InputCpf':
    case 'InputPhone':
    case 'InputDate':
    case 'InputAutocomplete':
    case 'InputTextarea':
    case 'InputSelect':
      return '';
    default:
      return undefined;
  }
}

/**
 * Visitor function type for traverseFormSchema
 */
export type FieldVisitor = (field: FieldNode) => void;

/**
 * Traverse a FormSchema and call visitor for each input field found.
 * Tracks the full path to each field matching the orchestrator's name path logic.
 * 
 * Path building rules (matching component-orchestrator.ts):
 * - Direct children of FormContainer (root properties) are included
 * - Field components (type: 'field') add their key to the path
 * - Other containers just pass through the parent path
 * 
 * @param schema - The FormSchema to traverse
 * @param visitor - Function called for each field found
 * 
 * @example
 * ```typescript
 * traverseFormSchema(schema, (field) => {
 *   console.log(`Found field: ${field.name} at path ${field.path} (${field.component})`);
 * });
 * ```
 */
export function traverseFormSchema(schema: FormSchema, visitor: FieldVisitor): void {
  function traverse(obj: any, currentPath: string[] = [], isRootProperty: boolean = false): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    const component = obj['x-component'];

    // Check if this is a FormField component containing an input
    if (component === 'FormField' && obj.properties) {
      // Get x-ui from FormField wrapper (where visible is typically defined)
      const formFieldXUi = obj['x-ui'] || {};
      
      // Look for the actual input field inside the FormField
      for (const [key, value] of Object.entries(obj.properties)) {
        if (value && typeof value === 'object' && 'x-component' in value) {
          const inputComponent = (value as any)['x-component'];
          const props = (value as any)['x-component-props'] || {};
          // Get x-ui from input (can override FormField's x-ui)
          const inputXUi = (value as any)['x-ui'] || {};
          const inputXCustom = (value as any)['x-custom'] || false;
          
          // Check if it's an input component
          if (inputComponent && isInputComponent(inputComponent)) {
            // Build the full path: currentPath + field name
            // This matches how the orchestrator builds name paths
            const fieldPath = [...currentPath, key].join('.');
            
            // Resolve visible: input's x-ui.visible takes precedence, then FormField's, default is true
            const visible = inputXUi.visible !== undefined 
              ? inputXUi.visible 
              : (formFieldXUi.visible !== undefined ? formFieldXUi.visible : true);
            
            const field: FieldNode = {
              name: key,
              path: fieldPath,
              type: getTypeForComponent(inputComponent),
              component: inputComponent,
              label: props.label,
              visible,
              custom: inputXCustom,
              props,
            };
            visitor(field);
          }
        }
      }
      return; // Don't traverse deeper inside FormField
    }

    // Recursively traverse properties
    if (obj.properties) {
      for (const [key, value] of Object.entries(obj.properties)) {
        if (value && typeof value === 'object') {
          const childComponent = (value as any)['x-component'];
          
          // Determine if this key should be added to the path
          // This matches the orchestrator's logic in component-orchestrator.ts:
          // - Direct children of FormContainer (root properties) are included
          // - Only FormSectionContainer adds to path (it's a root property container)
          // - Other containers (FormSectionGroup, FormSectionGroupContainer, etc.) don't add to path
          const isRootChild = component === 'FormContainer';
          const shouldIncludeInPath = isRootChild && childComponent === 'FormSectionContainer';
          
          const newPath = shouldIncludeInPath ? [...currentPath, key] : currentPath;
          
          traverse(value, newPath, isRootChild);
        }
      }
    }
  }

  traverse(schema, [], false);
}

/**
 * Extract all fields from a FormSchema
 * 
 * @param schema - The FormSchema to extract fields from
 * @returns Array of FieldNode objects with full paths
 * 
 * @example
 * ```typescript
 * const fields = extractFieldsFromSchema(schema);
 * const fieldNames = fields.map(f => f.name);
 * const fieldPaths = fields.map(f => f.path);
 * const requiredFields = fields.filter(f => f.props.required);
 * ```
 */
export function extractFieldsFromSchema(schema: FormSchema): FieldNode[] {
  const fields: FieldNode[] = [];
  traverseFormSchema(schema, (field) => {
    fields.push(field);
  });
  return fields;
}

/**
 * Set a value at a nested path in an object
 * 
 * @param obj - Object to modify
 * @param path - Dot-separated path (e.g., 'personalInfo.firstName')
 * @param value - Value to set
 */
function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Build initial values from a FormSchema with proper nested structure.
 * 
 * @param schema - The FormSchema to extract initial values from
 * @returns Object with nested structure matching form field paths
 * 
 * @example
 * ```typescript
 * const initialValues = buildInitialValues(schema);
 *  { personalInfo: { firstName: '', lastName: '' }, acceptTerms: false }
 * ```
 */
export function buildInitialValues(schema: FormSchema): Record<string, any> {
  const initialValues: Record<string, any> = {};
  
  traverseFormSchema(schema, (field) => {
    setNestedValue(initialValues, field.path, getDefaultValueForComponent(field.component));
  });
  
  return initialValues;
}
