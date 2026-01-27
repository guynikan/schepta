/**
 * Form schema definition
 */
export interface FormSchema {
  $id: string
  $schema?: string
  type: "object"
  properties: FormSchemaProperties
  "x-component": "FormContainer"
}
export interface FormSchemaProperties {
  [k: string]: FormSectionContainer
}
/**
 * This interface was referenced by `FormSchemaProperties`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormSectionContainer {
  type: "object"
  "x-ui": xUi
  properties: FormSectionContainerProperties
  "x-component": "FormSectionContainer"
  "x-custom"?: boolean
  "x-component-props"?: FormSectionContainerComponentProps
}
export interface xUi {
  /**
   * Order of the section in the form (lower values appear first)
   */
  order: number
}
export interface FormSectionContainerProperties {
  /**
   * This interface was referenced by `FormSectionContainerProperties`'s JSON-Schema definition
   * via the `patternProperty` "^.*$".
   */
  [k: string]: FormSectionTitle | FormSectionGroupContainer
}
export interface FormSectionTitle {
  type: "object"
  "x-slots"?: XSlots
  "x-content": string
  "x-component": "FormSectionTitle"
  "x-custom"?: boolean
  "x-component-props"?: FormSectionTitleComponentProps
}
export interface XSlots {
  [k: string]: unknown
}
export interface FormSectionTitleComponentProps {
  [k: string]: unknown
}
export interface FormSectionGroupContainer {
  type: "object"
  properties: FormSectionGroupContainerProperties
  "x-component": "FormSectionGroupContainer"
  "x-custom"?: boolean
  "x-component-props"?: FormSectionGroupContainerComponentProps
}
export interface FormSectionGroupContainerProperties {
  [k: string]: FormSectionGroup
}
/**
 * This interface was referenced by `FormSectionGroupContainerProperties`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormSectionGroup {
  type: "object"
  properties: FormSectionGroupProperties
  "x-component": "FormSectionGroup"
  "x-custom"?: boolean
  "x-component-props"?: FormSectionGroupComponentProps
}
export interface FormSectionGroupProperties {
  [k: string]: FormField
}
/**
 * FormField wrapper (Grid) reusable for any type of input
 *
 * This interface was referenced by `FormSectionGroupProperties`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 */
export interface FormField {
  type: "object"
  "x-component": "FormField"
  "x-custom"?: boolean
  "x-ui": xUi
  properties: FormFieldProperties
  "x-component-props"?: FormFieldComponentProps
}
export interface FormFieldProperties {
  /**
   * This interface was referenced by `FormFieldProperties`'s JSON-Schema definition
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
export interface InputText {
  type: "string"
  "x-component": "InputText"
  "x-custom"?: boolean
  "x-component-props"?: InputTextComponentProps
}
export interface InputTextComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputSelect {
  type: "string"
  "x-component": "InputSelect"
  "x-custom"?: boolean
  "x-component-props"?: InputSelectComponentProps
}
export interface InputSelectComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputCheckbox {
  type: "boolean"
  "x-component": "InputCheckbox"
  "x-custom"?: boolean
  "x-component-props"?: InputCheckboxComponentProps
}
export interface InputCheckboxComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputDate {
  type: "string"
  "x-component": "InputDate"
  "x-custom"?: boolean
  "x-component-props"?: InputDateComponentProps
}
export interface InputDateComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputPhone {
  type: "string"
  "x-component": "InputPhone"
  "x-custom"?: boolean
  "x-component-props"?: InputPhoneComponentProps
}
export interface InputPhoneComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputAutocomplete {
  type: "string"
  "x-component": "InputAutocomplete"
  "x-custom"?: boolean
  "x-component-props"?: InputAutocompleteComponentProps
}
export interface InputAutocompleteComponentProps {
  label?: string
  placeholder?: string
  [k: string]: unknown
}
export interface InputTextarea {
  type: "string"
  "x-component": "InputTextarea"
  "x-custom"?: boolean
  "x-component-props"?: InputTextareaComponentProps
}
export interface InputTextareaComponentProps {
  [k: string]: unknown
}
export interface InputNumber {
  type: "number"
  "x-component": "InputNumber"
  "x-custom"?: boolean
  "x-component-props"?: InputNumberComponentProps
}
export interface InputNumberComponentProps {
  [k: string]: unknown
}
export interface FormFieldComponentProps {
  [k: string]: unknown
}
export interface FormSectionGroupComponentProps {
  [k: string]: unknown
}
export interface FormSectionGroupContainerComponentProps {
  [k: string]: unknown
}
export interface FormSectionContainerComponentProps {
  [k: string]: unknown
}
