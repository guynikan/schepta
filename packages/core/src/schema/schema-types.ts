/**
 * Schema de formulário
 */
export interface FormSchema {
  $id: string
  $schema?: string
  type: "object"
  properties: {
    [k: string]: FormSectionContainer
  }
  "x-component": "FormContainer"
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormSectionContainer {
  type: "object"
  "x-ui": {
    /**
     * Order of the section in the form (lower values appear first)
     */
    order: number
  }
  properties: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^.*$".
     */
    [k: string]: FormSectionTitle | FormSectionGroupContainer
  }
  "x-component": "FormSectionContainer"
  "x-component-props"?: {
    [k: string]: unknown
  }
}
export interface FormSectionTitle {
  type: "object"
  "x-slots"?: {
    [k: string]: unknown
  }
  "x-content": string
  "x-component": "FormSectionTitle"
  "x-component-props"?: {
    [k: string]: unknown
  }
}
export interface FormSectionGroupContainer {
  type: "object"
  properties: {
    [k: string]: FormSectionGroup
  }
  "x-component": "FormSectionGroupContainer"
  "x-component-props"?: {
    [k: string]: unknown
  }
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormSectionGroup {
  type: "object"
  properties: {
    [k: string]: FormField
  }
  "x-component": "FormSectionGroup"
  "x-component-props"?: {
    [k: string]: unknown
  }
}
/**
 * FormField wrapper (Grid) reutilizável para qualquer tipo de input
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormField {
  type: "object"
  "x-component": "FormField"
  "x-ui": {
    /**
     * Order of the field in the form (lower values appear first)
     */
    order: number
  }
  properties: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z_][a-zA-Z0-9_]*$".
     */
    [k: string]:
      | InputText
      | InputSelect
      | InputCheckbox
      | InputDate
      | InputPhone
      | InputAutocomplete
      | InputTextarea
      | InputNumber
  }
  "x-component-props"?: {
    [k: string]: unknown
  }
}
export interface InputText {
  type: "string"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputText"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputSelect {
  type: "string"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputSelect"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputCheckbox {
  type: "boolean"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputCheckbox"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputDate {
  type: "string"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputDate"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputPhone {
  type: "string"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputPhone"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputAutocomplete {
  type: "string"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-component": "InputAutocomplete"
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    label?: string
    placeholder?: string
    [k: string]: unknown
  }
}
export interface InputTextarea {
  type: "string"
  "x-component": "InputTextarea"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    [k: string]: unknown
  }
}
export interface InputNumber {
  type: "number"
  "x-component": "InputNumber"
  "x-rules"?: {
    [k: string]: unknown
  }
  "x-reactions"?: {
    [k: string]: unknown
  }
  "x-component-props"?: {
    [k: string]: unknown
  }
}
