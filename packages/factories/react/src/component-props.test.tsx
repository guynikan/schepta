import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { FormFactory } from './form-factory';
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
                      'x-component-props': { label: 'Email', variant: 'outlined', helperText: 'help', fullWidth: true, sx: { m: 1 } },
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
    const titleProps: Record<string, any>[] = [];
    const inputProps: Record<string, any>[] = [];
    const externalContext = { user: 'u' };

    render(
      <FormFactory
        schema={customPropsSchema}
        externalContext={externalContext}
        components={{
          FormSectionTitle: createComponentSpec({
            id: 'FormSectionTitle', type: 'content',
            component: () => (props: Record<string, any>) => { titleProps.push(props); return <h4>{props['x-content']}</h4>; },
          }),
          InputText: createComponentSpec({
            id: 'InputText', type: 'field',
            component: () => (props: Record<string, any>) => { inputProps.push(props); return <span>{props.helperText}</span>; },
          }),
        }}
      />
    );

    const title = titleProps[titleProps.length - 1];
    expect(title['x-content']).toBe('Custom title');
    expect(title['x-component-props']).toEqual({ variant: 'h5', color: 'primary' });
    expect(title.variant).toBe('h5');
    expect(title.color).toBe('primary');
    expect(title.externalContext).toMatchObject(externalContext);

    const input = inputProps[inputProps.length - 1];
    expect(input).toMatchObject({ name: 'section.email', label: 'Email', variant: 'outlined', helperText: 'help', fullWidth: true, sx: { m: 1 } });
    expect(input.externalContext).toMatchObject(externalContext);
    expect(input.schema).toMatchObject({ type: 'string', 'x-component': 'InputText' });
    expect(typeof input.onChange).toBe('function');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders simple-form.json with the default components and no dropped-prop warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(<FormFactory schema={simpleFormSchema} externalContext={{ user: 'u' }} />);

    expect(container.querySelector('h2')?.textContent).toBe('Personal Information');
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('placeholder', 'Enter your first name');
    expect(inputs[1]).toBeRequired();
    expect(container.querySelector('label[for="personalInfo.firstName"]')?.textContent).toBe('First Name');
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
