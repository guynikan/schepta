import { createSemanticCatalog } from './catalog';
import type { SemanticCatalog } from './types';

const string = { type: 'string' } as const;
const children = { content: { multiple: true } };

/**
 * The only vocabulary shipped by the React/MUI harness. It is intentionally
 * semantic: renderer names and framework props never cross this boundary.
 */
export const reactMuiCatalog: SemanticCatalog = createSemanticCatalog({
  version: 'react-mui-1',
  components: {
    Page: { propsSchema: { type: 'object', properties: { title: string, description: string }, additionalProperties: false }, slots: children },
    Form: { propsSchema: { type: 'object', properties: { title: string, description: string }, additionalProperties: false }, slots: children, actions: { submit: 'submit' } },
    Stack: { propsSchema: { type: 'object', properties: { orientation: { enum: ['horizontal', 'vertical'] }, gap: { type: 'number', minimum: 0 } }, additionalProperties: false }, slots: children },
    Text: { propsSchema: { type: 'object', properties: { text: string, variant: { enum: ['display', 'title', 'heading', 'body', 'small', 'muted'] } }, required: ['text'], additionalProperties: false } },
    TextInput: { propsSchema: { type: 'object', properties: { label: string, placeholder: string, required: { type: 'boolean' }, minLength: { type: 'integer', minimum: 0 }, maxLength: { type: 'integer', minimum: 0 }, pattern: string, inputType: { enum: ['text', 'email', 'password'] } }, required: ['label'], additionalProperties: false }, bindings: { value: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Select: { propsSchema: { type: 'object', properties: { label: string, required: { type: 'boolean' }, options: { type: 'array', minItems: 1, items: { type: 'object', properties: { value: string, label: string }, required: ['value', 'label'], additionalProperties: false } } }, required: ['label', 'options'], additionalProperties: false }, bindings: { value: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Checkbox: { propsSchema: { type: 'object', properties: { label: string, required: { type: 'boolean' } }, required: ['label'], additionalProperties: false }, bindings: { checked: ['read', 'write', 'twoWay'] }, actions: { change: 'change' } },
    Button: { propsSchema: { type: 'object', properties: { label: string, kind: { enum: ['primary', 'secondary', 'quiet', 'danger'] }, submit: { type: 'boolean' } }, required: ['label'], additionalProperties: false }, actions: { press: 'submit' } },
    Alert: { propsSchema: { type: 'object', properties: { title: string, message: string, severity: { enum: ['info', 'success', 'warning', 'error'] } }, required: ['message'], additionalProperties: false } },
  },
  actions: {
    submit: { argsSchema: { type: 'object', additionalProperties: false } },
    change: { argsSchema: { type: 'object', additionalProperties: false } },
  },
});
