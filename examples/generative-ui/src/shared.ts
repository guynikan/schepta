import {
  createSemanticCatalog,
  type SemanticCatalog,
  type UiSpec,
} from '@schepta/core';

/** The catalog is shared by both renderers; renderer packages own the mappings. */
export const demoCatalog: SemanticCatalog = createSemanticCatalog({
  version: 'schepta-demo-1',
  components: Object.fromEntries([
    'Page', 'Form', 'Stack', 'Text', 'TextInput', 'Select', 'ChoiceGroup', 'Checkbox', 'Button', 'Alert',
  ].map((component) => [component, {
    description: `${component} semantic component`,
    propsSchema: { type: 'object', additionalProperties: true },
  }])),
  actions: {
    submit_prompt: {
      description: 'Accept the required name and show a success state.',
      argsSchema: { type: 'object', additionalProperties: false },
    },
  },
});

/** A stable offline candidate that exercises bindings, validation and actions. */
export const demoSpec: UiSpec = {
  version: '1.0',
  root: 'page',
  metadata: {
    fixture: 'offline-welcome-flow',
    semanticContract: 'UiSpec 1.0',
  },
  elements: {
    page: {
      component: 'Page',
      props: {
        title: 'A small welcome, rendered twice.',
        subtitle: 'One semantic contract. Two UI systems. Zero renderer-specific props.',
      },
      children: ['form'],
    },
    form: {
      component: 'Form',
      props: {
        title: 'Prove the contract',
        description: 'Leave the field empty to see declarative validation block submit, then enter a name.',
      },
      children: ['name', 'submit'],
      actions: { submit: 'submitAction' },
    },
    name: {
      component: 'TextInput',
      props: {
        label: 'Your name',
        placeholder: 'e.g. Ada Lovelace',
        required: true,
        helpText: 'This value is bound to state.profileName.',
      },
      bindings: { value: 'profileName' },
    },
    submit: {
      component: 'Button',
      props: { label: 'Continue', submit: true, type: 'submit', variant: 'primary' },
    },
  },
  state: {
    profileName: { schema: { type: 'string' }, initial: '' },
  },
  bindings: {
    profileName: { path: 'state.profileName', mode: 'twoWay' },
  },
  actions: {
    submitAction: { action: 'submit_prompt', args: {} },
  },
};

export type DemoMode = 'offline' | 'openai';

export interface PublicGenerationResponse {
  spec: UiSpec;
  validation: ReturnType<typeof import('@schepta/core').validateUiSpec>;
  trace: import('@schepta/core').UiGenerationTrace;
}
