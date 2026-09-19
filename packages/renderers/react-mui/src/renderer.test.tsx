import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UiSpec } from '@schepta/core';
import { UiSpecRenderError, UiSpecRenderer } from './index';

const onboardingSpec: UiSpec = {
  version: '1.0',
  root: 'page',
  elements: {
    page: { component: 'Page', props: { title: 'Welcome' }, slots: { content: ['form'] } },
    form: { component: 'Form', slots: { content: ['intro', 'name', 'role', 'terms', 'submit'] } },
    intro: { component: 'Text', props: { text: 'Create your account', variant: 'heading' } },
    name: { component: 'TextInput', props: { label: 'Name', required: true }, bindings: { value: 'name' } },
    role: { component: 'Select', props: { label: 'Role', options: [{ value: 'builder', label: 'Builder' }] }, bindings: { value: 'role' } },
    terms: { component: 'Checkbox', props: { label: 'Accept terms' }, bindings: { checked: 'terms' } },
    submit: { component: 'Button', props: { label: 'Continue', submit: true }, actions: { press: 'submit' } },
  },
  state: {
    name: { schema: { type: 'string' }, initial: '' },
    role: { schema: { type: 'string' }, initial: '' },
    terms: { schema: { type: 'boolean' }, initial: false },
  },
  bindings: {
    name: { path: 'state.name', mode: 'twoWay' },
    role: { path: 'state.role', mode: 'twoWay' },
    terms: { path: 'state.terms', mode: 'twoWay' },
  },
  actions: { submit: { action: 'submit', args: {} } },
};

describe('UiSpecRenderer', () => {
  it('renders an onboarding spec and preserves two-way input state', () => {
    const onStateChange = vi.fn();
    render(<UiSpecRenderer spec={onboardingSpec} onStateChange={onStateChange} />);

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.change(name, { target: { value: 'Ada' } });
    expect(name).toHaveValue('Ada');
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Ada' }));

    const terms = screen.getByRole('checkbox', { name: 'Accept terms' });
    fireEvent.click(terms);
    expect(terms).toBeChecked();
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ terms: true }));
  });

  it('invokes semantic actions with the current state and declarative args', () => {
    const onAction = vi.fn();
    render(<UiSpecRenderer spec={onboardingSpec} onAction={onAction} initialState={{ name: 'Ada' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'submit',
      args: {},
      state: expect.objectContaining({ name: 'Ada' }),
      elementId: 'submit',
      eventName: 'press',
    }));
  });

  it('validates required inputs before invoking an action', () => {
    const onAction = vi.fn();
    render(<UiSpecRenderer spec={onboardingSpec} onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('renders status and input messages using semantic props', () => {
    render(<UiSpecRenderer spec={onboardingSpec} error="Could not save" inputMessages={{ name: 'Name is required' }} />);
    expect(screen.getByRole('alert', { name: '' })).toHaveTextContent('Could not save');
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('uses shared semantic validation and JEXL visibility behavior', () => {
    const onAction = vi.fn();
    const spec: UiSpec = {
      ...onboardingSpec,
      elements: {
        ...onboardingSpec.elements,
        name: { component: 'TextInput', props: { label: 'Name', placeholder: 'For {{ $formValues.role }}', minLength: 3 }, bindings: { value: 'name' } },
        role: { component: 'Select', props: { label: 'Role', options: [{ value: 'team', label: 'Team' }, { value: 'solo', label: 'Solo' }] }, bindings: { value: 'role' } },
        terms: { component: 'Checkbox', props: { label: 'Accept terms', visible: "{{ $formValues.role === 'team' }}" }, bindings: { checked: 'terms' } },
      },
    };
    render(<UiSpecRenderer spec={spec} onAction={onAction} />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('placeholder', 'For ');
    expect(screen.queryByRole('checkbox', { name: 'Accept terms' })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Team' }));
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Al' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
  });

  it('blocks submission for an unchecked required checkbox and an empty required choice', () => {
    const onAction = vi.fn();
    const spec: UiSpec = {
      ...onboardingSpec,
      elements: {
        ...onboardingSpec.elements,
        role: { component: 'ChoiceGroup', props: { label: 'Plan', required: true, options: [{ value: 'team', label: 'Team' }] }, bindings: { value: 'role' } },
        terms: { component: 'Checkbox', props: { label: 'Accept terms', required: true }, bindings: { checked: 'terms' } },
      },
    };
    render(<UiSpecRenderer spec={spec} onAction={onAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText('Plan is required')).toBeInTheDocument();
    expect(screen.getByText('Accept terms is required')).toBeInTheDocument();
  });

  it('renders the remaining semantic choice and alert components', () => {
    const spec: UiSpec = {
      version: '1.0',
      root: 'layout',
      elements: {
        layout: { component: 'Stack', slots: { content: ['choice', 'alert'] } },
        choice: { component: 'ChoiceGroup', props: { label: 'Plan', options: [{ value: 'team', label: 'Team' }] } },
        alert: { component: 'Alert', props: { severity: 'success', message: 'Ready' } },
      },
    };
    render(<UiSpecRenderer spec={spec} />);
    expect(screen.getByRole('radio', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Ready');
  });

  it('rejects components outside the renderer catalog', () => {
    const spec = { ...onboardingSpec, elements: { ...onboardingSpec.elements, intro: { component: 'Dialog' } } };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<UiSpecRenderer spec={spec} />)).toThrow(UiSpecRenderError);
      expect(() => render(<UiSpecRenderer spec={spec} />)).toThrow('Unknown UiSpec component "Dialog"');
    } finally {
      consoleError.mockRestore();
    }
  });

  it('rejects props outside the shared semantic contract before rendering', () => {
    const spec = { ...onboardingSpec, elements: { ...onboardingSpec.elements, name: { ...onboardingSpec.elements.name, props: { label: 'Name', variant: 'outlined' } } } };
    expect(() => render(<UiSpecRenderer spec={spec} />)).toThrow(UiSpecRenderError);
  });

  it('exposes the structured validation report and does not render invalid bindings', () => {
    const spec = { ...onboardingSpec, elements: { ...onboardingSpec.elements, name: { ...onboardingSpec.elements.name, bindings: { value: 'missing' } } } };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<UiSpecRenderer spec={spec} />)).toThrow(UiSpecRenderError);
      try {
        render(<UiSpecRenderer spec={spec} />);
      } catch (error) {
        expect(error).toBeInstanceOf(UiSpecRenderError);
        expect((error as UiSpecRenderError).report?.errors).toContainEqual(expect.objectContaining({ code: 'unknown-binding' }));
      }
      expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
