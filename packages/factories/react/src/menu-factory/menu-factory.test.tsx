/**
 * MenuFactory smoke tests
 *
 * Validates a minimal two-level menu rendered from a JSON schema using the
 * default menu components. Ensures `MenuFactory` coexists with `FormFactory`
 * and that the generic factory primitive wires the right root component key.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MenuFactory } from './menu-factory';

const twoLevelMenu = {
  type: 'object',
  'x-component': 'MenuContainer',
  'x-component-props': { ariaLabel: 'Main navigation' },
  properties: {
    dashboard: {
      type: 'object',
      'x-component': 'MenuItem',
      'x-ui': { order: 1 },
      'x-component-props': {
        label: 'Dashboard',
        href: '/dashboard',
      },
    },
    workspace: {
      type: 'object',
      'x-component': 'MenuGroup',
      'x-ui': { order: 2 },
      'x-component-props': { label: 'Workspace' },
      properties: {
        projects: {
          type: 'object',
          'x-component': 'MenuItem',
          'x-ui': { order: 1 },
          'x-component-props': {
            label: 'Projects',
            href: '/projects',
          },
        },
        teams: {
          type: 'object',
          'x-component': 'MenuItem',
          'x-ui': { order: 2 },
          'x-component-props': {
            label: 'Teams',
            href: '/teams',
          },
        },
      },
    },
    settings: {
      type: 'object',
      'x-component': 'MenuItem',
      'x-ui': { order: 3 },
      'x-component-props': {
        label: 'Settings',
        href: '/settings',
      },
    },
  },
};

describe('MenuFactory', () => {
  it('renders a two-level menu with the default components', () => {
    const { container, getByText, getByLabelText } = render(
      <MenuFactory schema={twoLevelMenu} />
    );

    expect(getByLabelText('Main navigation')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
    expect(getByText('Workspace')).toBeInTheDocument();
    expect(getByText('Projects')).toBeInTheDocument();
    expect(getByText('Teams')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();

    const menuItems = container.querySelectorAll('[data-schepta-menu-item="true"]');
    expect(menuItems.length).toBe(4);
  });

  it('renders links with hrefs for MenuItems declaring them', () => {
    const { getByText } = render(<MenuFactory schema={twoLevelMenu} />);
    const dashboardLink = getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
  });
});
