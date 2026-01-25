/**
 * Schema Types
 * 
 * Type definitions for form and menu schemas.
 * Compatible with JSON Schema format.
 */

/**
 * Base schema property
 */
export interface BaseSchemaProperty {
  type: string;
  'x-component'?: string;
  'x-component-props'?: Record<string, any>;
  'x-rules'?: Record<string, any>;
  'x-reactions'?: Record<string, any>;
  'x-ui'?: {
    order?: number;
    [key: string]: any;
  };
  'x-content'?: any;
  'x-slots'?: Record<string, any>;
}

/**
 * Form schema structure
 */
export interface FormSchema extends BaseSchemaProperty {
  type: 'object';
  $id?: string;
  $schema?: string;
  properties?: Record<string, FormSectionContainer>;
  required?: string[];
}

/**
 * Form section container
 */
export interface FormSectionContainer extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'FormSectionContainer';
  properties?: Record<string, FormSectionTitle | FormSectionGroupContainer>;
}

/**
 * Form section title
 */
export interface FormSectionTitle extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'FormSectionTitle';
  'x-content': string;
}

/**
 * Form section group container
 */
export interface FormSectionGroupContainer extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'FormSectionGroupContainer';
  properties?: Record<string, FormSectionGroup>;
}

/**
 * Form section group
 */
export interface FormSectionGroup extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'FormSectionGroup';
  properties?: Record<string, FormField>;
}

/**
 * Form field
 */
export interface FormField extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'FormField';
  properties?: Record<string, FieldComponent>;
}

/**
 * Field component types
 */
export type FieldComponent = 
  | InputText
  | InputSelect
  | InputCheckbox
  | InputDate
  | InputCpf
  | InputPhone
  | InputTextarea
  | InputNumber
  | InputAutocomplete;

/**
 * Input text
 */
export interface InputText extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputText';
}

/**
 * Input select
 */
export interface InputSelect extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputSelect';
}

/**
 * Input checkbox
 */
export interface InputCheckbox extends BaseSchemaProperty {
  type: 'boolean';
  'x-component': 'InputCheckbox';
}

/**
 * Date picker
 */
export interface InputDate extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputDate';
}

/**
 * Input CPF
 */
export interface InputCpf extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputCpf';
}

/**
 * Input phone
 */
export interface InputPhone extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputPhone';
}

/**
 * Input autocomplete
 */
export interface InputAutocomplete extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputAutocomplete';
}

/**
 * Input textarea
 */
export interface InputTextarea extends BaseSchemaProperty {
  type: 'string';
  'x-component': 'InputTextarea';
}

/**
 * Input number
 */
export interface InputNumber extends BaseSchemaProperty {
  type: 'number';
  'x-component': 'InputNumber';
}

/**
 * Menu schema structure
 */
export interface MenuSchema extends BaseSchemaProperty {
  type: 'object';
  properties?: Record<string, MenuContainer>;
}

/**
 * Menu container
 */
export interface MenuContainer extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'MenuContainer';
  'x-content'?: {
    items?: MenuItem[];
  };
}

/**
 * Menu item
 */
export interface MenuItem extends BaseSchemaProperty {
  type: 'object';
  'x-component': 'MenuLink' | 'MenuButton';
  'x-component-props'?: {
    href?: string;
    onClick?: string;
    [key: string]: any;
  };
  'x-content'?: {
    text?: string;
  };
}

