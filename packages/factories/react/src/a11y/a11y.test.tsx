/**
 * Accessibility suite
 *
 * Two kinds of assertion:
 *
 *  - `axe` runs against each factory's rendered output to catch structural
 *    violations (dangling aria references, invalid role combinations,
 *    unlabelled controls).
 *  - Explicit keyboard tests, because axe cannot tell whether arrow keys move
 *    between tabs or whether focus is trapped in a dialog — those are the
 *    failures that actually lock a keyboard user out.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { NativeReactFormAdapter } from '@schepta/adapter-react';

import { FormFactory } from '../form-factory';
import { MenuFactory } from '../menu-factory';
import { TableFactory } from '../table-factory';
import { TabsFactory } from '../tabs-factory';
import { ModalFactory } from '../modal-factory';
import { LayoutFactory } from '../layout-factory';

/** Runs axe and asserts no violations. */
async function expectNoViolations(element: Element) {
  expect(await axe(element)).toHaveNoViolations();
}

const q = (selector: string) => document.body.querySelector(selector);
const qa = (selector: string) =>
  Array.from(document.body.querySelectorAll(selector));

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const formSchema: any = {
  $id: 'a11y-form',
  type: 'object',
  'x-component': 'FormContainer',
  properties: {
    account: {
      type: 'object',
      'x-component': 'FormSectionContainer',
      'x-ui': { order: 1 },
      properties: {
        title: {
          type: 'object',
          'x-component': 'FormSectionTitle',
          'x-content': 'Account',
        },
        groups: {
          type: 'object',
          'x-component': 'FormSectionGroupContainer',
          properties: {
            main: {
              type: 'object',
              'x-component': 'FormSectionGroup',
              properties: {
                emailField: {
                  type: 'object',
                  'x-component': 'FormField',
                  'x-ui': { order: 1 },
                  properties: {
                    email: {
                      type: 'string',
                      'x-component': 'InputText',
                      'x-component-props': {
                        label: 'Email',
                        required: true,
                        description: 'Used to sign you in',
                      },
                    },
                  },
                },
                roleField: {
                  type: 'object',
                  'x-component': 'FormField',
                  'x-ui': { order: 2 },
                  properties: {
                    role: {
                      type: 'string',
                      'x-component': 'InputSelect',
                      'x-component-props': {
                        label: 'Role',
                        required: true,
                        options: [
                          { value: 'admin', label: 'Admin' },
                          { value: 'viewer', label: 'Viewer' },
                        ],
                      },
                    },
                  },
                },
                termsField: {
                  type: 'object',
                  'x-component': 'FormField',
                  'x-ui': { order: 3 },
                  properties: {
                    terms: {
                      type: 'boolean',
                      'x-component': 'InputCheckbox',
                      'x-component-props': { label: 'Accept the terms' },
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
};

const tabsSchema: any = {
  type: 'object',
  'x-component': 'TabsContainer',
  'x-component-props': { ariaLabel: 'Account', orientation: 'horizontal' },
  properties: {
    overview: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 1 },
      'x-component-props': { label: 'Overview' },
      'x-content': 'Overview panel',
    },
    members: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 2 },
      'x-component-props': { label: 'Members', badge: 3 },
      'x-content': 'Members panel',
    },
    locked: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 3 },
      'x-component-props': { label: 'Locked', disabled: true },
      'x-content': 'Locked panel',
    },
    billing: {
      type: 'object',
      'x-component': 'TabPanel',
      'x-ui': { order: 4 },
      'x-component-props': { label: 'Billing' },
      'x-content': 'Billing panel',
    },
  },
};

const modalSchema: any = {
  type: 'object',
  'x-component': 'ModalContainer',
  'x-component-props': { size: 'md', dismissible: true },
  properties: {
    header: {
      type: 'object',
      'x-component': 'ModalHeader',
      'x-ui': { order: 1 },
      'x-component-props': {
        title: 'Delete project',
        description: 'This cannot be undone',
      },
    },
    body: {
      type: 'object',
      'x-component': 'ModalBody',
      'x-ui': { order: 2 },
      'x-content': 'Are you sure?',
    },
  },
};

const tableSchema: any = {
  type: 'object',
  'x-component': 'TableContainer',
  'x-component-props': { ariaLabel: 'Team members' },
  properties: {
    name: {
      type: 'object',
      'x-component': 'TableColumn',
      'x-ui': { order: 1 },
      'x-component-props': { label: 'Name', field: 'name', sortable: true },
    },
    role: {
      type: 'object',
      'x-component': 'TableColumn',
      'x-ui': { order: 2 },
      'x-component-props': { label: 'Role', field: 'role' },
    },
  },
};

const tableRows = [
  { id: 'u1', name: 'Charlie', role: 'Admin' },
  { id: 'u2', name: 'Alice', role: 'Editor' },
  { id: 'u3', name: 'Bob', role: 'Viewer' },
];

const menuSchema: any = {
  type: 'object',
  'x-component': 'MenuContainer',
  'x-component-props': { ariaLabel: 'Main navigation' },
  properties: {
    dashboard: {
      type: 'object',
      'x-component': 'MenuItem',
      'x-ui': { order: 1 },
      'x-component-props': { label: 'Dashboard', href: '/dashboard', active: true },
    },
    archived: {
      type: 'object',
      'x-component': 'MenuItem',
      'x-ui': { order: 2 },
      'x-component-props': { label: 'Archived', href: '/archived', disabled: true },
    },
  },
};

const layoutSchema: any = {
  type: 'object',
  'x-component': 'LayoutContainer',
  'x-component-props': { variant: 'with-sidebar', isPageRoot: true },
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

// ---------------------------------------------------------------------------
// axe
// ---------------------------------------------------------------------------

describe('axe: no violations in default components', () => {
  it('FormFactory', async () => {
    const { container } = render(
      <FormFactory schema={formSchema} onSubmit={() => {}} validateOnSubmit />
    );
    await expectNoViolations(container);
  });

  it('FormFactory with validation errors shown', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FormFactory schema={formSchema} onSubmit={() => {}} validateOnSubmit />
    );

    await user.click(q('[data-test-id="submit-button"]')!);
    await waitFor(() => {
      expect(q('[data-test-id="form-error-summary"]')).not.toBeNull();
    });

    await expectNoViolations(container);
  });

  it('MenuFactory', async () => {
    const { container } = render(<MenuFactory schema={menuSchema} />);
    await expectNoViolations(container);
  });

  it('TabsFactory', async () => {
    const { container } = render(<TabsFactory schema={tabsSchema} />);
    await expectNoViolations(container);
  });

  it('TableFactory (plain)', async () => {
    const { container } = render(<TableFactory schema={tableSchema} rows={tableRows} />);
    await expectNoViolations(container);
  });

  it('TableFactory (selectable rows become a grid)', async () => {
    const { container } = render(
      <TableFactory schema={tableSchema} rows={tableRows} selectionMode="multiple" />
    );
    expect(q('table')?.getAttribute('role')).toBe('grid');
    expect(q('table')?.getAttribute('aria-multiselectable')).toBe('true');
    await expectNoViolations(container);
  });

  it('LayoutFactory', async () => {
    const { container } = render(<LayoutFactory schema={layoutSchema} />);
    await expectNoViolations(container);
  });

  it('ModalFactory (open)', async () => {
    render(<ModalFactory schema={modalSchema} defaultOpen />);
    // Portalled to body, so axe has to run against the dialog itself.
    await expectNoViolations(q('[data-schepta-modal="true"]')!);
  });
});

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

describe('form field accessibility', () => {
  it('associates label, hint and error without dangling references', async () => {
    const user = userEvent.setup();
    render(<FormFactory schema={formSchema} onSubmit={() => {}} validateOnSubmit />);

    const input = q('input[type="text"], input:not([type])') as HTMLInputElement;
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-invalid')).toBeNull();

    // Every id referenced by aria-describedby must resolve to a real element.
    const describedBefore = input.getAttribute('aria-describedby')!.split(' ');
    expect(describedBefore).toHaveLength(1);
    describedBefore.forEach((id) => expect(document.getElementById(id)).not.toBeNull());

    await user.click(q('[data-test-id="submit-button"]')!);

    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));

    const describedAfter = input.getAttribute('aria-describedby')!.split(' ');
    expect(describedAfter).toHaveLength(2);
    describedAfter.forEach((id) => expect(document.getElementById(id)).not.toBeNull());
  });

  it('generates unique ids across two instances of the same schema', () => {
    render(
      <>
        <FormFactory schema={formSchema} />
        <FormFactory schema={formSchema} />
      </>
    );

    const ids = qa('input, select').map((el) => el.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('moves focus to the error summary on a failed submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FormFactory schema={formSchema} onSubmit={onSubmit} validateOnSubmit />);

    await user.click(q('[data-test-id="submit-button"]')!);

    await waitFor(() => {
      expect(document.activeElement).toBe(q('[data-test-id="form-error-summary"]'));
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('moves focus to the error summary on every failed submit attempt', async () => {
    const user = userEvent.setup();
    render(<FormFactory schema={formSchema} onSubmit={() => {}} validateOnSubmit />);
    const submit = q('[data-test-id="submit-button"]')!;

    await user.click(submit);
    await waitFor(() => {
      expect(document.activeElement).toBe(q('[data-test-id="form-error-summary"]'));
    });

    const input = q('input[type="text"], input:not([type])') as HTMLElement;
    input.focus();
    expect(document.activeElement).toBe(input);

    await user.click(submit);
    await waitFor(() => {
      expect(document.activeElement).toBe(q('[data-test-id="form-error-summary"]'));
    });
  });

  it('does not steal focus when a field error changes after a failed submit', async () => {
    const user = userEvent.setup();
    const adapter = new NativeReactFormAdapter({});
    adapter.register('account.email', { validate: (value) => value ? true : 'Required' });
    adapter.register('account.role', { validate: (value) => value ? true : 'Required' });
    render(<FormFactory schema={formSchema} onSubmit={() => {}} adapter={adapter} />);

    await user.click(q('[data-test-id="submit-button"]')!);
    await waitFor(() => {
      expect(document.activeElement).toBe(q('[data-test-id="form-error-summary"]'));
    });

    const first = q('input[name="account.email"]') as HTMLInputElement;
    first.focus();

    // A field-level update changes the error count without starting a new
    // submit attempt. The summary must not reclaim focus in response.
    act(() => adapter.clearErrors('account.email'));

    await waitFor(() => {
      expect(q('[data-test-id="form-error-summary"] h2')?.textContent).toBe(
        '1 field needs your attention'
      );
      expect(document.activeElement).toBe(first);
    });

    await user.click(q('[data-test-id="submit-button"]')!);
    await waitFor(() => {
      expect(document.activeElement).toBe(q('[data-test-id="form-error-summary"]'));
    });
  });

  it('names and links each summarized field error', async () => {
    const user = userEvent.setup();
    render(<FormFactory schema={formSchema} onSubmit={() => {}} validateOnSubmit />);

    await user.click(q('[data-test-id="submit-button"]')!);
    await waitFor(() => {
      expect(q('[data-test-id="form-error-summary"] a')).not.toBeNull();
    });

    const link = q('[data-test-id="form-error-summary"] a') as HTMLAnchorElement;
    expect(link.textContent).toBe('account.email');
    expect(link.hash).toBe(`#${q('input[name="account.email"]')?.id}`);
  });

  it('names each section from its heading', () => {
    render(<FormFactory schema={formSchema} />);
    const section = q('section[aria-labelledby]')!;
    const heading = document.getElementById(section.getAttribute('aria-labelledby')!);
    expect(heading?.tagName).toBe('H2');
    expect(heading?.textContent).toBe('Account');
  });
});

// ---------------------------------------------------------------------------
// Tabs keyboard
// ---------------------------------------------------------------------------

describe('tabs keyboard navigation', () => {
  const triggers = () => qa('[role="tab"]') as HTMLElement[];

  it('exposes a single tab stop and moves with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<TabsFactory schema={tabsSchema} />);

    // Only the active tab is reachable with Tab.
    expect(triggers().map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);

    triggers()[0].focus();
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(triggers()[1]);
    expect(triggers()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('skips disabled tabs when navigating', async () => {
    const user = userEvent.setup();
    render(<TabsFactory schema={tabsSchema} />);

    triggers()[1].focus();
    await user.keyboard('{ArrowRight}');

    // index 2 is disabled, so focus lands on index 3
    expect(document.activeElement).toBe(triggers()[3]);
  });

  it('supports Home and End', async () => {
    const user = userEvent.setup();
    render(<TabsFactory schema={tabsSchema} />);

    triggers()[0].focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(triggers()[3]);

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(triggers()[0]);
  });

  it('points every trigger at a panel that exists', () => {
    render(<TabsFactory schema={tabsSchema} />);
    for (const trigger of triggers()) {
      const panelId = trigger.getAttribute('aria-controls')!;
      expect(document.getElementById(panelId)).not.toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Modal focus management
// ---------------------------------------------------------------------------

describe('modal focus management', () => {
  it('names the dialog from the header title', () => {
    render(<ModalFactory schema={modalSchema} defaultOpen />);
    const dialog = q('[role="dialog"]')!;
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    expect(title?.textContent).toBe('Delete project');

    const description = document.getElementById(dialog.getAttribute('aria-describedby')!);
    expect(description?.textContent).toBe('This cannot be undone');
  });

  it('moves focus into the dialog on open and back to the opener on close', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button data-test-id="opener" onClick={() => setOpen(true)}>
            Open
          </button>
          <ModalFactory schema={modalSchema} open={open} onOpenChange={setOpen} />
        </>
      );
    }

    render(<Harness />);
    const opener = q('[data-test-id="opener"]') as HTMLElement;
    opener.focus();
    await user.click(opener);

    await waitFor(() => {
      const dialog = q('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog!.contains(document.activeElement)).toBe(true);
    });

    await user.keyboard('{Escape}');

    // Focus returns to the trigger, so the user continues from where they were
    // instead of being dropped at the top of the document.
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup();
    render(<ModalFactory schema={modalSchema} defaultOpen />);

    const dialog = q('[role="dialog"]')!;
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Table keyboard
// ---------------------------------------------------------------------------

describe('table keyboard navigation', () => {
  it('uses a roving tab stop instead of one per row', async () => {
    const user = userEvent.setup();
    render(
      <TableFactory schema={tableSchema} rows={tableRows} selectionMode="single" />
    );

    const rowEls = qa('tbody tr') as HTMLElement[];
    expect(rowEls.map((r) => r.tabIndex)).toEqual([0, -1, -1]);

    rowEls[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(rowEls[1]);
  });

  it('leaves rows out of the tab order when selection is disabled', () => {
    render(<TableFactory schema={tableSchema} rows={tableRows} />);
    for (const row of qa('tbody tr')) {
      expect(row.hasAttribute('tabindex')).toBe(false);
      expect(row.hasAttribute('aria-selected')).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

describe('menu accessibility', () => {
  it('marks the active item and removes disabled items from the tab order', () => {
    render(<MenuFactory schema={menuSchema} />);

    const active = q('[data-test-id="dashboard"]') ?? qa('a')[0];
    expect(active.getAttribute('aria-current')).toBe('page');

    const disabled = qa('a').find(
      (a) => a.getAttribute('aria-disabled') === 'true'
    ) as HTMLElement;
    expect(disabled.tabIndex).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

describe('layout landmarks', () => {
  it('renders a skip link targeting the main landmark', () => {
    render(<LayoutFactory schema={layoutSchema} />);

    const skip = q('[data-test-id="layout-skip-link"]') as HTMLAnchorElement;
    const targetId = skip.getAttribute('href')!.slice(1);
    const main = document.getElementById(targetId)!;

    expect(main.tagName).toBe('MAIN');
    // Focusable, otherwise following the link only scrolls and leaves focus
    // behind in the header.
    expect(main.tabIndex).toBe(-1);
  });

  it('claims banner/contentinfo only when it is the page root', () => {
    const { unmount } = render(<LayoutFactory schema={layoutSchema} />);
    expect(q('header')?.getAttribute('role')).toBe('banner');
    expect(q('footer')?.getAttribute('role')).toBe('contentinfo');
    unmount();

    const nested = {
      ...layoutSchema,
      'x-component-props': { variant: 'with-sidebar' },
    };
    render(<LayoutFactory schema={nested} />);
    expect(q('header')?.getAttribute('role')).toBeNull();
    expect(q('footer')?.getAttribute('role')).toBeNull();
  });
});
