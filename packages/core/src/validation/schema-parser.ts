/**
 * Schema Parser
 * 
 * Generates AJV-compatible JSON Schema from FormSchema for form data validation.
 * The output is compatible with @hookform/resolvers/ajv.
 */

import type { FormSchema } from '../schema/schema-types';
import { 
  extractFieldsFromSchema, 
  buildInitialValues,
  type FieldNode 
} from './schema-traversal';

/**
 * Validation messages for a single field
 */
export interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  minimum?: string;
  maximum?: string;
  format?: string;
}

/**
 * Result of parsing a FormSchema
 */
export interface ParsedSchema {
  /** JSON Schema for AJV validation - pass to ajvResolver */
  jsonSchema: Record<string, any>;
  /** Initial values extracted from schema (nested structure) */
  initialValues: Record<string, any>;
  /** Field paths extracted from schema (e.g., 'personalInfo.firstName') */
  fields: string[];
}

/**
 * Options for schema parser
 */
export interface SchemaParserOptions {
  /** Custom error messages (i18n) - keyed by locale */
  messages?: Record<string, ValidationMessages>;
  /** Default locale key (defaults to 'en') */
  locale?: string;
  /** Whether to allow additional properties in the JSON Schema */
  additionalProperties?: boolean;
}

/**
 * Default validation messages with interpolation placeholders
 */
const DEFAULT_MESSAGES: ValidationMessages = {
  required: '{{label}} is required',
  minLength: '{{label}} must be at least {{minLength}} characters',
  maxLength: '{{label}} must be at most {{maxLength}} characters',
  pattern: '{{label}} format is invalid',
  minimum: '{{label}} must be at least {{min}}',
  maximum: '{{label}} must be at most {{max}}',
  format: '{{label}} format is invalid',
};

/**
 * Interpolate message template with field data
 * 
 * @param template - Message template with {{placeholders}}
 * @param data - Data object with values to interpolate
 * @returns Interpolated message
 */
function interpolateMessage(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
  });
}

/**
 * Build error messages for a field based on its validation rules
 * 
 * @param field - Field node from schema
 * @param messages - Validation messages to use
 * @returns AJV errorMessage object
 */
function buildErrorMessages(
  field: FieldNode, 
  messages: ValidationMessages
): Record<string, string> | undefined {
  const errorMessage: Record<string, string> = {};
  const { props, label, name } = field;
  const fieldLabel = label || name;
  
  const data = {
    label: fieldLabel,
    field: name,
    minLength: props.minLength,
    maxLength: props.maxLength,
    min: props.min,
    max: props.max,
  };
  
  // Required validation - AJV uses minLength:1 for strings
  if (props.required && messages.required) {
    errorMessage.minLength = interpolateMessage(messages.required, data);
  }
  
  // MinLength validation (when not just for required)
  if (props.minLength !== undefined && props.minLength > 1 && messages.minLength) {
    errorMessage.minLength = interpolateMessage(messages.minLength, data);
  }
  
  // MaxLength validation
  if (props.maxLength !== undefined && messages.maxLength) {
    errorMessage.maxLength = interpolateMessage(messages.maxLength, data);
  }
  
  // Pattern validation
  if (props.pattern && messages.pattern) {
    errorMessage.pattern = interpolateMessage(messages.pattern, data);
  }
  
  // Minimum validation (for numbers)
  if (props.min !== undefined && messages.minimum) {
    errorMessage.minimum = interpolateMessage(messages.minimum, data);
  }
  
  // Maximum validation (for numbers)
  if (props.max !== undefined && messages.maximum) {
    errorMessage.maximum = interpolateMessage(messages.maximum, data);
  }
  
  return Object.keys(errorMessage).length > 0 ? errorMessage : undefined;
}

/**
 * Build JSON Schema property for a single field
 * 
 * @param field - Field node from schema
 * @param messages - Validation messages to use
 * @returns JSON Schema property definition
 */
function buildFieldProperty(
  field: FieldNode,
  messages: ValidationMessages
): Record<string, any> {
  const { type, props } = field;
  const property: Record<string, any> = { type };
  
  // Handle required for string fields - use minLength: 1
  if (props.required && type === 'string') {
    property.minLength = props.minLength !== undefined 
      ? Math.max(1, props.minLength) 
      : 1;
  } else if (props.minLength !== undefined) {
    property.minLength = props.minLength;
  }
  
  // MaxLength
  if (props.maxLength !== undefined) {
    property.maxLength = props.maxLength;
  }
  
  // Pattern
  if (props.pattern) {
    property.pattern = props.pattern;
  }
  
  // Minimum (for numbers)
  if (props.min !== undefined && type === 'number') {
    property.minimum = props.min;
  }
  
  // Maximum (for numbers)
  if (props.max !== undefined && type === 'number') {
    property.maximum = props.max;
  }
  
  // Required for boolean (must be true)
  if (props.required && type === 'boolean') {
    property.const = true;
  }
  
  // Add error messages
  const errorMessage = buildErrorMessages(field, messages);
  if (errorMessage) {
    property.errorMessage = errorMessage;
  }
  
  return property;
}

/**
 * Set a nested property in a JSON Schema object structure
 * Creates intermediate 'type: object' nodes as needed
 * 
 * @param schema - Schema object to modify
 * @param path - Dot-separated path (e.g., 'personalInfo.firstName')
 * @param property - Property definition to set
 * @param isRequired - Whether the field is required
 */
function setNestedSchemaProperty(
  schema: Record<string, any>,
  path: string,
  property: Record<string, any>,
  isRequired: boolean
): void {
  const keys = path.split('.');
  let current = schema;
  
  // Navigate/create nested structure
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (!current.properties) {
      current.properties = {};
    }
    
    if (!current.properties[key]) {
      current.properties[key] = {
        type: 'object',
        properties: {},
        additionalProperties: true,
      };
    }
    
    current = current.properties[key];
  }
  
  // Set the final property
  const finalKey = keys[keys.length - 1];
  if (!current.properties) {
    current.properties = {};
  }
  current.properties[finalKey] = property;
  
  // Handle required at the correct level
  if (isRequired) {
    if (!current.required) {
      current.required = [];
    }
    if (!current.required.includes(finalKey)) {
      current.required.push(finalKey);
    }
  }
}

/**
 * Generates a JSON Schema from FormSchema for AJV validation.
 * The output is compatible with @hookform/resolvers/ajv.
 * Creates nested schema structure matching the form field paths.
 * 
 * @param schema - The FormSchema to parse
 * @param options - Parser options
 * @returns ParsedSchema with jsonSchema, initialValues, and fields
 * 
 * @example
 * ```typescript
 * import { ajvResolver } from '@hookform/resolvers/ajv';
 * import { generateValidationSchema } from '@schepta/core';
 * 
 * const { jsonSchema, initialValues, fields } = generateValidationSchema(formSchema, {
 *   messages: {
 *     en: { required: '{{label}} is required' },
 *     pt: { required: '{{label}} é obrigatório' }
 *   },
 *   locale: 'pt'
 * });
 * 
 * const { register, handleSubmit } = useForm({
 *   defaultValues: initialValues,
 *   resolver: ajvResolver(jsonSchema),
 * });
 * ```
 */
export function generateValidationSchema(
  schema: FormSchema,
  options: SchemaParserOptions = {}
): ParsedSchema {
  const { 
    messages = {}, 
    locale = 'en',
    additionalProperties = true 
  } = options;
  
  // Get messages for the specified locale, falling back to defaults
  const localeMessages = messages[locale] || DEFAULT_MESSAGES;
  const mergedMessages = { ...DEFAULT_MESSAGES, ...localeMessages };
  
  // Extract fields from schema
  const fieldNodes = extractFieldsFromSchema(schema);
  
  // Build nested JSON Schema
  const jsonSchema: Record<string, any> = {
    type: 'object',
    properties: {},
    additionalProperties,
  };
  
  for (const field of fieldNodes) {
    const property = buildFieldProperty(field, mergedMessages);
    const isRequired = field.props.required === true;
    
    // Set property at the correct nested path
    setNestedSchemaProperty(jsonSchema, field.path, property, isRequired);
  }
  
  return {
    jsonSchema,
    initialValues: buildInitialValues(schema),
    fields: fieldNodes.map(f => f.path),
  };
}
