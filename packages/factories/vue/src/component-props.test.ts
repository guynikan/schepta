import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
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
                      'x-component-props': { label: 'Email', variant: 'outlined', hint: 'help', density: 'compact' },
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
    const titleAttrs: Record<string, any>[] = [];
    const inputAttrs: Record<string, any>[] = [];
    const externalContext = { user: 'u' };

    const HostTitle = defineComponent({
      inheritAttrs: false,
      setup(_props, { attrs }) {
        return () => { titleAttrs.push({ ...attrs }); return h('h4', String(attrs['x-content'])); };
      },
    });
    const HostInput = defineComponent({
      inheritAttrs: false,
      setup(_props, { attrs }) {
        return () => { inputAttrs.push({ ...attrs }); return h('span', String(attrs.hint)); };
      },
    });

    const wrapper = mount(FormFactory, {
      props: {
        schema: customPropsSchema,
        externalContext,
        components: {
          FormSectionTitle: createComponentSpec({ id: 'FormSectionTitle', type: 'content', component: () => HostTitle }),
          InputText: createComponentSpec({ id: 'InputText', type: 'field', component: () => HostInput }),
        },
      },
    });

    expect(wrapper.find('h4').text()).toBe('Custom title');
    const title = titleAttrs[titleAttrs.length - 1];
    expect(title['x-content']).toBe('Custom title');
    expect(title['x-component-props']).toEqual({ variant: 'h5', color: 'primary' });
    expect(title.variant).toBe('h5');
    expect(title.color).toBe('primary');
    expect(title.externalContext).toMatchObject(externalContext);

    expect(wrapper.find('span').text()).toBe('help');
    const input = inputAttrs[inputAttrs.length - 1];
    expect(input).toMatchObject({ name: 'section.email', label: 'Email', variant: 'outlined', hint: 'help', density: 'compact' });
    expect(input.externalContext).toMatchObject(externalContext);
    expect(input.schema).toMatchObject({ type: 'string', 'x-component': 'InputText' });
    expect(typeof input.onChange).toBe('function');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders simple-form.json with the default components and no dropped-prop warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mount(FormFactory, { props: { schema: simpleFormSchema, externalContext: { user: 'u' } } });

    expect(wrapper.find('h2').text()).toBe('Personal Information');
    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes('placeholder')).toBe('Enter your first name');
    expect(inputs[1].attributes('required')).toBeDefined();
    expect(wrapper.find('label[for="personalInfo.firstName"]').text()).toBe('First Name');
    expect(wrapper.html()).not.toContain('[object Object]');
    expect(wrapper.html()).not.toContain('externalcontext');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
