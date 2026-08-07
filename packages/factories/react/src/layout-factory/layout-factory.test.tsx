/**
 * LayoutFactory smoke tests
 *
 * Validates the application shell factory renders all four slots, respects
 * the 'with-sidebar' variant + sidebarPosition, omits missing slots
 * gracefully, and exposes the imperative ref API listing declared slots.
 */

import React, { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LayoutFactory, type LayoutFactoryRef } from './layout-factory';

const fullShellSchema = {
  type: 'object',
  'x-component': 'LayoutContainer',
  'x-component-props': {
    ariaLabel: 'Full shell',
    variant: 'with-sidebar',
    sidebarPosition: 'left',
  },
  properties: {
    header: {
      type: 'object',
      'x-component': 'LayoutHeader',
      'x-ui': { order: 1 },
      'x-content': 'App brand',
    },
    sidebar: {
      type: 'object',
      'x-component': 'LayoutSidebar',
      'x-ui': { order: 2 },
      'x-component-props': { collapsible: true, width: '200px' },
      'x-content': 'Nav',
    },
    main: {
      type: 'object',
      'x-component': 'LayoutMain',
      'x-ui': { order: 3 },
      'x-content': 'Main content',
    },
    footer: {
      type: 'object',
      'x-component': 'LayoutFooter',
      'x-ui': { order: 4 },
      'x-content': 'Legal',
    },
  },
};

describe('LayoutFactory', () => {
  it('renders all declared slots with the right semantic tags', () => {
    const { container } = render(<LayoutFactory schema={fullShellSchema} />);

    expect(container.querySelector('[data-schepta-layout="true"]')).not.toBeNull();
    expect(container.querySelector('header[data-slot="header"]')).not.toBeNull();
    expect(container.querySelector('aside[data-slot="sidebar"]')).not.toBeNull();
    expect(container.querySelector('main[data-slot="main"]')).not.toBeNull();
    expect(container.querySelector('footer[data-slot="footer"]')).not.toBeNull();

    expect(container.textContent).toContain('App brand');
    expect(container.textContent).toContain('Nav');
    expect(container.textContent).toContain('Main content');
    expect(container.textContent).toContain('Legal');
  });

  it('applies variant + sidebarPosition data attributes', () => {
    const { container } = render(
      <LayoutFactory
        schema={{
          ...fullShellSchema,
          'x-component-props': {
            ...fullShellSchema['x-component-props'],
            sidebarPosition: 'right',
          },
        }}
      />
    );

    const layoutEl = container.querySelector(
      '[data-schepta-layout="true"]'
    ) as HTMLElement;
    expect(layoutEl.getAttribute('data-layout-variant')).toBe('with-sidebar');
    expect(layoutEl.getAttribute('data-sidebar-position')).toBe('right');
  });

  it('renders without sidebar when variant is "default"', () => {
    const schema = {
      type: 'object',
      'x-component': 'LayoutContainer',
      'x-component-props': { variant: 'default' },
      properties: {
        header: {
          type: 'object',
          'x-component': 'LayoutHeader',
          'x-content': 'H',
        },
        main: {
          type: 'object',
          'x-component': 'LayoutMain',
          'x-content': 'M',
        },
        footer: {
          type: 'object',
          'x-component': 'LayoutFooter',
          'x-content': 'F',
        },
      },
    };

    const { container } = render(<LayoutFactory schema={schema} />);
    expect(container.querySelector('aside[data-slot="sidebar"]')).toBeNull();
    expect(container.querySelector('header[data-slot="header"]')).not.toBeNull();
    expect(container.querySelector('main[data-slot="main"]')).not.toBeNull();
    expect(container.querySelector('footer[data-slot="footer"]')).not.toBeNull();
  });

  it('renders only the slots declared in the schema', () => {
    const schema = {
      type: 'object',
      'x-component': 'LayoutContainer',
      properties: {
        main: {
          type: 'object',
          'x-component': 'LayoutMain',
          'x-content': 'Only main',
        },
      },
    };

    const { container } = render(<LayoutFactory schema={schema} />);
    expect(container.querySelector('main[data-slot="main"]')).not.toBeNull();
    expect(container.querySelector('header[data-slot="header"]')).toBeNull();
    expect(container.querySelector('aside[data-slot="sidebar"]')).toBeNull();
    expect(container.querySelector('footer[data-slot="footer"]')).toBeNull();
  });

  it('exposes an imperative ref API listing the declared slots', () => {
    const ref = createRef<LayoutFactoryRef>();
    render(<LayoutFactory ref={ref} schema={fullShellSchema} />);

    expect(ref.current?.getSlots()).toEqual(['header', 'sidebar', 'main', 'footer']);
    expect(ref.current?.hasSlot('sidebar')).toBe(true);
    expect(ref.current?.hasSlot('ghost')).toBe(false);
  });

  it('forwards ariaLabel to the container', () => {
    const { container } = render(<LayoutFactory schema={fullShellSchema} />);
    const layoutEl = container.querySelector('[data-schepta-layout="true"]')!;
    expect(layoutEl.getAttribute('aria-label')).toBe('Full shell');
  });

  it('applies sticky flag to header and footer', () => {
    const schema = {
      ...fullShellSchema,
      properties: {
        ...fullShellSchema.properties,
        header: {
          ...fullShellSchema.properties.header,
          'x-component-props': { sticky: true },
        },
        footer: {
          ...fullShellSchema.properties.footer,
          'x-component-props': { sticky: true },
        },
      },
    };
    const { container } = render(<LayoutFactory schema={schema} />);
    const header = container.querySelector('header[data-slot="header"]') as HTMLElement;
    const footer = container.querySelector('footer[data-slot="footer"]') as HTMLElement;
    expect(header.style.position).toBe('sticky');
    expect(footer.style.position).toBe('sticky');
  });
});
