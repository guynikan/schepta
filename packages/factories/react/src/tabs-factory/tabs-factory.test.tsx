/**
 * TabsFactory smoke tests
 *
 * Covers: initial render of the tab list, auto-selection of the first
 * enabled tab, activating a tab via click, honoring the disabled flag,
 * optional icons and badges, orientation / variant data attributes,
 * initialActiveTab prop, onChange callback, ref API and panel switching.
 */

import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { TabsFactory, type TabsFactoryRef } from './tabs-factory';

const accountSchema = {
  type: 'object',
  'x-component': 'TabsContainer',
  'x-component-props': {
    ariaLabel: 'Account',
    orientation: 'horizontal',
    variant: 'underline',
  },
  properties: {
    overview: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 1 },
      'x-component-props': { label: 'Overview', icon: '📊' },
      'x-content': 'Overview panel',
    },
    members: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 2 },
      'x-component-props': { label: 'Members', badge: 3 },
      'x-content': 'Members panel',
    },
    billing: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 3 },
      'x-component-props': { label: 'Billing' },
      'x-content': 'Billing panel',
    },
    advanced: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 4 },
      'x-component-props': { label: 'Advanced', disabled: true },
      'x-content': 'Advanced panel',
    },
  },
};

describe('TabsFactory', () => {
  it('renders a tab trigger per declared panel, in order', () => {
    const { container } = render(<TabsFactory schema={accountSchema} />);
    const triggers = container.querySelectorAll('[role="tab"]');
    expect(triggers).toHaveLength(4);
    expect(triggers[0].textContent).toContain('Overview');
    expect(triggers[1].textContent).toContain('Members');
    expect(triggers[2].textContent).toContain('Billing');
    expect(triggers[3].textContent).toContain('Advanced');
  });

  it('auto-activates the first enabled tab and renders its panel', () => {
    const { container, getByText } = render(<TabsFactory schema={accountSchema} />);
    const firstTrigger = container.querySelector(
      '[data-test-id="tab-overview"]'
    ) as HTMLElement;
    expect(firstTrigger.getAttribute('aria-selected')).toBe('true');
    expect(getByText('Overview panel')).toBeInTheDocument();
    // Inactive panels are not in the DOM
    expect(container.textContent).not.toContain('Members panel');
  });

  it('activates a tab on click and fires onChange', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <TabsFactory schema={accountSchema} onChange={onChange} />
    );

    const membersTrigger = container.querySelector(
      '[data-test-id="tab-members"]'
    ) as HTMLElement;
    fireEvent.click(membersTrigger);

    expect(membersTrigger.getAttribute('aria-selected')).toBe('true');
    expect(getByText('Members panel')).toBeInTheDocument();
    expect(container.textContent).not.toContain('Overview panel');
    expect(onChange).toHaveBeenLastCalledWith({ key: 'members', label: 'Members' });
  });

  it('ignores clicks on disabled tabs', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <TabsFactory schema={accountSchema} onChange={onChange} />
    );

    const disabledTrigger = container.querySelector(
      '[data-test-id="tab-advanced"]'
    ) as HTMLButtonElement;
    // aria-disabled rather than the native `disabled` attribute: a disabled
    // tab must stay in the accessibility tree so screen reader users know it
    // exists, while still being unreachable by pointer, keyboard and Tab.
    expect(disabledTrigger.getAttribute('aria-disabled')).toBe('true');
    expect(disabledTrigger.disabled).toBe(false);
    expect(disabledTrigger.tabIndex).toBe(-1);

    fireEvent.click(disabledTrigger);
    expect(onChange).not.toHaveBeenCalled();
    // First tab still active
    expect(getByText('Overview panel')).toBeInTheDocument();
  });

  it('honors initialActiveTab when the tab is valid and enabled', () => {
    const { container, getByText } = render(
      <TabsFactory schema={accountSchema} initialActiveTab="billing" />
    );
    expect(
      container.querySelector('[data-test-id="tab-billing"]')?.getAttribute('aria-selected')
    ).toBe('true');
    expect(getByText('Billing panel')).toBeInTheDocument();
  });

  it('falls back to the first enabled tab when initialActiveTab is disabled', () => {
    const { container } = render(
      <TabsFactory schema={accountSchema} initialActiveTab="advanced" />
    );
    expect(
      container.querySelector('[data-test-id="tab-overview"]')?.getAttribute('aria-selected')
    ).toBe('true');
  });

  it('renders icons and badges from schema props', () => {
    const { container, getByText } = render(<TabsFactory schema={accountSchema} />);
    expect(getByText('📊')).toBeInTheDocument();
    expect(
      container.querySelector('[data-test-id="tab-members-badge"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-test-id="tab-members-badge"]')?.textContent).toBe('3');
  });

  it('applies orientation and variant data attributes to the root', () => {
    const verticalSchema = {
      ...accountSchema,
      'x-component-props': {
        ...accountSchema['x-component-props'],
        orientation: 'vertical',
        variant: 'pills',
      },
    };
    const { container } = render(<TabsFactory schema={verticalSchema} />);
    const root = container.querySelector('[data-schepta-tabs="true"]') as HTMLElement;
    expect(root.getAttribute('data-orientation')).toBe('vertical');
    expect(root.getAttribute('data-variant')).toBe('pills');

    const tablist = container.querySelector('[role="tablist"]')!;
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('exposes an imperative ref API to get / set / list tabs', () => {
    const ref = createRef<TabsFactoryRef>();
    const onChange = vi.fn();
    const { container, getByText } = render(
      <TabsFactory ref={ref} schema={accountSchema} onChange={onChange} />
    );

    expect(ref.current?.getActiveTab()).toBe('overview');
    expect(ref.current?.getTabs().map((t) => t.key)).toEqual([
      'overview',
      'members',
      'billing',
      'advanced',
    ]);

    act(() => {
      ref.current?.setActiveTab('billing');
    });
    expect(ref.current?.getActiveTab()).toBe('billing');
    expect(getByText('Billing panel')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ key: 'billing', label: 'Billing' });

    // disabled tab is a no-op
    act(() => {
      ref.current?.setActiveTab('advanced');
    });
    expect(ref.current?.getActiveTab()).toBe('billing');

    // unknown tab is a no-op
    act(() => {
      ref.current?.setActiveTab('nonexistent');
    });
    expect(ref.current?.getActiveTab()).toBe('billing');

    // passing null clears the active tab
    act(() => {
      ref.current?.setActiveTab(null);
    });
    expect(ref.current?.getActiveTab()).toBe(null);
    // No panel is rendered
    expect(container.querySelector('[data-schepta-tab-panel="true"]')).toBeNull();
  });

  it('does not fire onChange when re-activating the same tab', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabsFactory schema={accountSchema} onChange={onChange} />
    );
    const overview = container.querySelector(
      '[data-test-id="tab-overview"]'
    ) as HTMLElement;
    fireEvent.click(overview);
    fireEvent.click(overview);
    expect(onChange).not.toHaveBeenCalled();
  });
});
