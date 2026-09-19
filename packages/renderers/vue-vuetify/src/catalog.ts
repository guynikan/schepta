import { createSemanticCatalog, type JsonSchema, type SemanticCatalog } from '@schepta/core';

/** Semantic component ids implemented by this renderer. */
export const VUE_VUETIFY_COMPONENTS = [
  'Page',
  'Form',
  'Stack',
  'Text',
  'TextInput',
  'Select',
  'ChoiceGroup',
  'Checkbox',
  'Button',
  'Alert',
] as const;

export type VueVuetifyComponent = typeof VUE_VUETIFY_COMPONENTS[number];

const textValue: JsonSchema = { type: ['string', 'number', 'boolean', 'null'] };
const inputProps: JsonSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    placeholder: { type: 'string' },
    value: textValue,
    defaultValue: textValue,
    required: { type: 'boolean' },
    disabled: { type: 'boolean' },
    readonly: { type: 'boolean' },
    helpText: { type: 'string' },
    errorMessage: { type: 'string' },
    messages: { type: ['string', 'array'] },
    name: { type: 'string' },
  },
  additionalProperties: true,
};

/** Catalog for validating specs intended for the Vue + Vuetify renderer. */
export const vueVuetifyCatalog: SemanticCatalog = createSemanticCatalog({
  version: '1.0',
  components: {
    Page: {
      description: 'A page-level container for an onboarding or workflow view.',
      propsSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
    Form: {
      description: 'A semantic form with submit handling and status messaging.',
      propsSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          submitLabel: { type: 'string' },
          loading: { type: 'boolean' },
          error: { type: ['string', 'array', 'null'] },
          success: { type: ['string', 'array', 'null'] },
        },
        additionalProperties: true,
      },
    },
    Stack: {
      description: 'A semantic layout container.',
      propsSchema: {
        type: 'object',
        properties: {
          direction: { enum: ['vertical', 'horizontal'] },
          gap: { type: 'number' },
          align: { type: 'string' },
          justify: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
    Text: {
      description: 'A semantic text block.',
      propsSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          text: { type: 'string' },
          variant: { type: 'string' },
          tone: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
    TextInput: { description: 'A single-line text input.', propsSchema: inputProps },
    Select: {
      description: 'A single-choice select input.',
      propsSchema: {
        ...inputProps,
        properties: { ...inputProps.properties, options: { type: 'array' }, items: { type: 'array' } },
      },
    },
    ChoiceGroup: {
      description: 'A group of mutually exclusive choices.',
      propsSchema: {
        ...inputProps,
        properties: { ...inputProps.properties, options: { type: 'array' }, items: { type: 'array' } },
      },
    },
    Checkbox: { description: 'A boolean input.', propsSchema: inputProps },
    Button: {
      description: 'An action button.',
      propsSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          variant: { type: 'string' },
          type: { enum: ['button', 'submit', 'reset'] },
          disabled: { type: 'boolean' },
          loading: { type: 'boolean' },
        },
        additionalProperties: true,
      },
    },
    Alert: {
      description: 'A status or informational message.',
      propsSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          title: { type: 'string' },
          tone: { enum: ['info', 'success', 'warning', 'error'] },
          dismissible: { type: 'boolean' },
        },
        additionalProperties: true,
      },
    },
  },
});
