import { createSemanticCatalog } from './catalog';
import type { JsonSchema, SemanticCatalog } from './types';

const string = { type: 'string' } as const;
const children = { content: { multiple: true } };
const booleanOrExpression: JsonSchema = { anyOf: [{ type: 'boolean' }, { type: 'string', pattern: '^\\{\\{.*\\}\\}$' }] };
const inputValidation: JsonSchema = {
  type: 'object',
  properties: {
    required: { type: 'boolean' }, minLength: { type: 'integer', minimum: 0 }, maxLength: { type: 'integer', minimum: 0 },
    pattern: string, minimum: { type: 'number' }, maximum: { type: 'number' }, min: { type: 'number' }, max: { type: 'number' },
    requiredMessage: string, minLengthMessage: string, maxLengthMessage: string, patternMessage: string,
    minimumMessage: string, maximumMessage: string, minMessage: string, maxMessage: string,
  },
  additionalProperties: false,
};
const commonInputProps: Record<string, JsonSchema> = {
  placeholder: string, required: booleanOrExpression, minLength: { type: 'integer', minimum: 0 }, maxLength: { type: 'integer', minimum: 0 },
  pattern: string, minimum: { type: 'number' }, maximum: { type: 'number' }, min: { type: 'number' }, max: { type: 'number' },
  requiredMessage: string, minLengthMessage: string, maxLengthMessage: string, patternMessage: string,
  minimumMessage: string, maximumMessage: string, minMessage: string, maxMessage: string,
  visible: booleanOrExpression, disabled: booleanOrExpression, validation: inputValidation,
};

/**
 * The one vocabulary shipped by the Generative UI runtime. It is intentionally
 * semantic: renderer names and framework props never cross this boundary.
 */
export const semanticUiCatalog: SemanticCatalog = createSemanticCatalog({
  version: '1.0',
  components: {
    Page: { propsSchema: { type: 'object', properties: { title: string, description: string }, additionalProperties: false }, slots: children },
    Form: { propsSchema: { type: 'object', properties: { title: string, description: string }, additionalProperties: false }, slots: children, actions: { submit: 'submit' } },
    Stack: { propsSchema: { type: 'object', properties: { orientation: { enum: ['horizontal', 'vertical'] }, gap: { type: 'number', minimum: 0 } }, additionalProperties: false }, slots: children },
    Text: { propsSchema: { type: 'object', properties: { text: string, variant: { enum: ['display', 'title', 'heading', 'body', 'small', 'muted'] } }, required: ['text'], additionalProperties: false } },
    TextInput: { propsSchema: { type: 'object', properties: { label: string, ...commonInputProps, inputType: { enum: ['text', 'email', 'password', 'number'] } }, required: ['label'], additionalProperties: false }, bindings: { value: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Select: { propsSchema: { type: 'object', properties: { label: string, ...commonInputProps, options: { type: 'array', minItems: 1, items: { type: 'object', properties: { value: string, label: string }, required: ['value', 'label'], additionalProperties: false } } }, required: ['label', 'options'], additionalProperties: false }, bindings: { value: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    ChoiceGroup: { propsSchema: { type: 'object', properties: { label: string, ...commonInputProps, options: { type: 'array', minItems: 1, items: { type: 'object', properties: { value: string, label: string }, required: ['value', 'label'], additionalProperties: false } } }, required: ['label', 'options'], additionalProperties: false }, bindings: { value: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Checkbox: { propsSchema: { type: 'object', properties: { label: string, ...commonInputProps }, required: ['label'], additionalProperties: false }, bindings: { checked: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Button: { propsSchema: { type: 'object', properties: { label: string, kind: { enum: ['primary', 'secondary', 'quiet', 'danger'] }, submit: { type: 'boolean' } }, required: ['label'], additionalProperties: false }, actions: { press: 'submit' } },
    Alert: { propsSchema: { type: 'object', properties: { title: string, message: string, severity: { enum: ['info', 'success', 'warning', 'error'] } }, required: ['message'], additionalProperties: false } },
  },
  actions: {
    submit: { argsSchema: { type: 'object', additionalProperties: false } },
    change: { argsSchema: { type: 'object', additionalProperties: false } },
  },
});

/** @deprecated Use semanticUiCatalog. Kept as a compatibility alias. */
export const reactMuiCatalog = semanticUiCatalog;
