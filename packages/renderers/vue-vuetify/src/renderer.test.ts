import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { nextTick } from 'vue';
import type { UiSpec } from '@schepta/core';
import {
  UiSpecRenderer,
  type UiActionContext,
} from './index';

function onboardingSpec(): UiSpec {
  return {
    version: '1.0',
    root: 'page',
    elements: {
      page: { component: 'Page', props: { title: 'Welcome' }, children: ['form'] },
      form: {
        component: 'Form',
        props: { title: 'Create your profile' },
        children: ['fields', 'status', 'submit'],
        actions: { submit: 'saveProfile' },
      },
      fields: {
        component: 'Stack',
        props: { gap: 12 },
        children: ['name', 'role', 'plan', 'terms'],
      },
      name: {
        component: 'TextInput',
        props: { label: 'Name', required: true },
        bindings: { value: 'nameValue' },
      },
      role: {
        component: 'Select',
        props: { label: 'Role', options: [{ label: 'Builder', value: 'builder' }] },
        bindings: { value: 'roleValue' },
      },
      plan: {
        component: 'ChoiceGroup',
        props: { label: 'Plan', options: [{ label: 'Starter', value: 'starter' }] },
        bindings: { value: 'planValue' },
      },
      terms: {
        component: 'Checkbox',
        props: { label: 'Accept terms', required: true },
        bindings: { checked: 'termsValue' },
      },
      status: { component: 'Alert', props: { message: 'Your profile is private.', tone: 'info' } },
      submit: {
        component: 'Button',
        props: { label: 'Continue', variant: 'primary' },
        actions: { press: 'saveProfile' },
      },
    },
    state: {
      name: { initial: '' },
      role: { initial: '' },
      plan: { initial: '' },
      terms: { initial: false },
    },
    bindings: {
      nameValue: { path: 'state.name', mode: 'twoWay' },
      roleValue: { path: 'state.role', mode: 'twoWay' },
      planValue: { path: 'state.plan', mode: 'twoWay' },
      termsValue: { path: 'state.terms', mode: 'twoWay' },
    },
    actions: {
      saveProfile: { action: 'save-profile' },
    },
  };
}

function mountRenderer(spec: UiSpec, options: Record<string, unknown> = {}) {
  return mount(UiSpecRenderer, {
    props: { spec, ...options },
    global: { plugins: [createVuetify()] },
  });
}

describe('Vue + Vuetify UiSpec renderer', () => {
  it('renders the onboarding catalog and keeps two-way bindings in state', async () => {
    const changes: Array<[string, unknown]> = [];
    const wrapper = mountRenderer(onboardingSpec(), {
      onStateChange: (path: string, value: unknown) => changes.push([path, value]),
    });

    expect(wrapper.find('[data-ui-id="page"]').exists()).toBe(true);
    expect(wrapper.find('[data-ui-id="name"] input').exists()).toBe(true);
    expect(wrapper.find('[data-ui-id="role"]').exists()).toBe(true);
    expect(wrapper.find('[data-ui-id="plan"]').exists()).toBe(true);
    expect(wrapper.find('[data-ui-id="terms"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Your profile is private.');

    await wrapper.find('[data-ui-id="name"] input').setValue('Ada Lovelace');
    expect(changes).toContainEqual(['state.name', 'Ada Lovelace']);
    expect((wrapper.vm as any).getValue('state.name')).toBe('Ada Lovelace');
  });

  it('validates required inputs and emits action context after interaction', async () => {
    const received: UiActionContext[] = [];
    const handler = vi.fn((context: UiActionContext) => received.push(context));
    const wrapper = mountRenderer(onboardingSpec(), {
      actionHandlers: { 'save-profile': handler },
    });

    expect((wrapper.vm as any).validate()).toBe(false);
    await nextTick();
    expect(wrapper.text()).toContain('Name is required');

    await wrapper.find('[data-ui-id="name"] input').setValue('Ada');
    await wrapper.find('[data-ui-id="name"] input').trigger('blur');
    expect((wrapper.vm as any).validate()).toBe(false); // terms is still required
    await nextTick();

    await wrapper.find('[data-ui-id="submit"]').trigger('click');
    expect(handler).not.toHaveBeenCalled();
    await wrapper.find('[data-ui-id="terms"] input').setValue(true);
    await wrapper.find('[data-ui-id="submit"]').trigger('click');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(received[0].action).toBe('save-profile');
    expect(received[0].state.name).toBe('Ada');
  });

  it('resolves JEXL visibility and hides conditional inputs', async () => {
    const spec = onboardingSpec();
    spec.elements.terms.props = { ...spec.elements.terms.props, visible: "{{ $formValues.role === 'builder' }}" };
    const wrapper = mountRenderer(spec);

    expect(wrapper.find('[data-ui-id="terms"]').exists()).toBe(false);
    (wrapper.vm as any).state.role = 'builder';
    await nextTick();
    expect(wrapper.find('[data-ui-id="terms"]').exists()).toBe(true);
  });

  it('supports renderer status messages and input messages', () => {
    const spec = onboardingSpec();
    const wrapper = mountRenderer(spec, {
      error: 'Unable to save profile.',
      success: 'Profile saved.',
      inputMessages: { name: 'Use your full name.' },
    });

    expect(wrapper.text()).toContain('Unable to save profile.');
    expect(wrapper.text()).toContain('Profile saved.');
    expect(wrapper.text()).toContain('Use your full name.');
  });

  it('rejects components outside the semantic renderer catalog', () => {
    const spec = onboardingSpec();
    spec.elements.page.component = 'VCard';
    expect(() => mountRenderer(spec)).toThrow('Unknown semantic component "VCard"');
  });
});
