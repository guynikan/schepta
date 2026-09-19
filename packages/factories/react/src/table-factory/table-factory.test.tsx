/**
 * TableFactory smoke tests
 *
 * Covers the core contract of the third built-in factory: rendering from a
 * JSON schema, toggling sort state via header clicks, single and multiple
 * row selection, empty state rendering, and the imperative ref API.
 */

import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import {
  TableFactory,
  type TableFactoryRef,
  type TableSortState,
} from './table-factory';

const teamSchema = {
  type: 'object',
  'x-component': 'TableContainer',
  'x-component-props': { ariaLabel: 'Team members' },
  properties: {
    name: {
      type: 'object',
      'x-component': 'TableColumn',
      'x-ui': { order: 1 },
      'x-component-props': {
        label: 'Name',
        field: 'name',
        sortable: true,
      },
    },
    role: {
      type: 'object',
      'x-component': 'TableColumn',
      'x-ui': { order: 2 },
      'x-component-props': {
        label: 'Role',
        field: 'role',
      },
    },
    seats: {
      type: 'object',
      'x-component': 'TableColumn',
      'x-ui': { order: 3 },
      'x-component-props': {
        label: 'Seats',
        field: 'seats',
        sortable: true,
      },
    },
  },
};

const rows = [
  { id: 'u1', name: 'Charlie', role: 'Admin', seats: 2 },
  { id: 'u2', name: 'Alice', role: 'Editor', seats: 4 },
  { id: 'u3', name: 'Bob', role: 'Viewer', seats: 1 },
];

const getRowOrder = (container: HTMLElement): string[] =>
  Array.from(
    container.querySelectorAll<HTMLTableRowElement>('tbody tr[data-row-key]')
  ).map((row) => row.getAttribute('data-row-key') as string);

describe('TableFactory', () => {
  it('renders headers and one row per item using schema columns', () => {
    const { container, getByText } = render(
      <TableFactory schema={teamSchema} rows={rows} />
    );

    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Role')).toBeInTheDocument();
    expect(getByText('Seats')).toBeInTheDocument();

    expect(getRowOrder(container)).toEqual(['u1', 'u2', 'u3']);
    expect(container.querySelectorAll('tbody tr[data-row-key]')).toHaveLength(3);
    expect(container.querySelector('table')?.getAttribute('aria-rowcount')).toBe('4');
  });

  it('applies format templates to cells', () => {
    const schemaWithFormat = {
      ...teamSchema,
      properties: {
        ...teamSchema.properties,
        role: {
          ...teamSchema.properties.role,
          'x-component-props': {
            ...teamSchema.properties.role['x-component-props'],
            format: '[{{ value }}]',
          },
        },
      },
    };
    const { getByText } = render(
      <TableFactory schema={schemaWithFormat} rows={rows.slice(0, 1)} />
    );
    expect(getByText('[Admin]')).toBeInTheDocument();
  });

  it('toggles sort ascending, descending, and back to unsorted on repeat clicks', () => {
    const onSort = vi.fn();
    const { container, getByRole } = render(
      <TableFactory schema={teamSchema} rows={rows} onSort={onSort} />
    );

    const nameHeaderButton = getByRole('button', { name: /name/i });

    fireEvent.click(nameHeaderButton);
    expect(getRowOrder(container)).toEqual(['u2', 'u3', 'u1']); // Alice, Bob, Charlie
    expect(onSort).toHaveBeenLastCalledWith({ column: 'name', direction: 'asc' });

    fireEvent.click(nameHeaderButton);
    expect(getRowOrder(container)).toEqual(['u1', 'u3', 'u2']); // Charlie, Bob, Alice
    expect(onSort).toHaveBeenLastCalledWith({ column: 'name', direction: 'desc' });

    fireEvent.click(nameHeaderButton);
    expect(getRowOrder(container)).toEqual(['u1', 'u2', 'u3']);
    expect(onSort).toHaveBeenLastCalledWith(null);
  });

  it('does not toggle sort on non-sortable columns', () => {
    const onSort = vi.fn();
    const { queryByRole } = render(
      <TableFactory schema={teamSchema} rows={rows} onSort={onSort} />
    );
    // Role column is not sortable, so the header has no button, just a span.
    expect(queryByRole('button', { name: /^role$/i })).toBeNull();
    expect(onSort).not.toHaveBeenCalled();
  });

  it('sorts numerically for numeric columns', () => {
    const { container, getByRole } = render(
      <TableFactory schema={teamSchema} rows={rows} />
    );
    fireEvent.click(getByRole('button', { name: /seats/i }));
    expect(getRowOrder(container)).toEqual(['u3', 'u1', 'u2']); // 1, 2, 4
  });

  it('honors single selection mode and emits onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <TableFactory
        schema={teamSchema}
        rows={rows}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />
    );

    const alice = container.querySelector('[data-row-key="u2"]') as HTMLElement;
    const bob = container.querySelector('[data-row-key="u3"]') as HTMLElement;

    fireEvent.click(alice);
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      keys: ['u2'],
      rows: [rows[1]],
    });
    expect(alice.getAttribute('data-row-selected')).toBe('true');

    fireEvent.click(bob);
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      keys: ['u3'],
      rows: [rows[2]],
    });
    expect(alice.getAttribute('data-row-selected')).toBeNull();
    expect(bob.getAttribute('data-row-selected')).toBe('true');

    fireEvent.click(bob);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ keys: [], rows: [] });
  });

  it('honors multiple selection mode', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <TableFactory
        schema={teamSchema}
        rows={rows}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(container.querySelector('[data-row-key="u1"]') as HTMLElement);
    fireEvent.click(container.querySelector('[data-row-key="u2"]') as HTMLElement);
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      keys: ['u1', 'u2'],
      rows: [rows[0], rows[1]],
    });

    fireEvent.click(container.querySelector('[data-row-key="u1"]') as HTMLElement);
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      keys: ['u2'],
      rows: [rows[1]],
    });
  });

  it('ignores clicks when selectionMode is "none"', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <TableFactory
        schema={teamSchema}
        rows={rows}
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(container.querySelector('[data-row-key="u1"]') as HTMLElement);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('renders emptyState when rows is empty', () => {
    const { getByText, container } = render(
      <TableFactory
        schema={teamSchema}
        rows={[]}
        emptyState={<span data-test-id="empty">Nothing here yet</span>}
      />
    );
    expect(getByText('Nothing here yet')).toBeInTheDocument();
    expect(container.querySelector('[data-test-id="table-empty-row"]')).not.toBeNull();
  });

  it('shows a loading row when loading=true', () => {
    const { container } = render(
      <TableFactory schema={teamSchema} rows={rows} loading />
    );
    expect(container.querySelector('[data-test-id="table-loading-row"]')).not.toBeNull();
    expect(container.querySelectorAll('tbody tr[data-row-key]')).toHaveLength(0);
  });

  it('exposes an imperative ref API for selection, sort, and visible rows', () => {
    const ref = createRef<TableFactoryRef>();
    const { container } = render(
      <TableFactory
        ref={ref}
        schema={teamSchema}
        rows={rows}
        selectionMode="multiple"
      />
    );

    expect(ref.current?.getSelectedKeys()).toEqual([]);
    expect(ref.current?.getSort()).toBeNull();
    expect(ref.current?.getVisibleRows().map((r) => r.id)).toEqual(['u1', 'u2', 'u3']);

    act(() => {
      ref.current?.setSelectedKeys(['u1', 'u3']);
    });
    expect(ref.current?.getSelectedKeys()).toEqual(['u1', 'u3']);
    expect(
      container.querySelector('[data-row-key="u1"]')?.getAttribute('data-row-selected')
    ).toBe('true');

    act(() => {
      ref.current?.setSort({ column: 'name', direction: 'desc' } as TableSortState);
    });
    expect(ref.current?.getSort()).toEqual({ column: 'name', direction: 'desc' });
    expect(ref.current?.getVisibleRows().map((r) => r.id)).toEqual(['u1', 'u3', 'u2']);

    act(() => {
      ref.current?.setSort(null);
    });
    expect(ref.current?.getSort()).toBeNull();
  });

  it('setSort is a no-op on non-sortable columns', () => {
    const ref = createRef<TableFactoryRef>();
    render(<TableFactory ref={ref} schema={teamSchema} rows={rows} />);
    act(() => {
      ref.current?.setSort({ column: 'role', direction: 'asc' });
    });
    expect(ref.current?.getSort()).toBeNull();
  });

  it('uses the provided rowKey function when given', () => {
    const { container } = render(
      <TableFactory
        schema={teamSchema}
        rows={rows}
        rowKey={(row) => `person:${row.name.toLowerCase()}`}
      />
    );
    expect(getRowOrder(container)).toEqual([
      'person:charlie',
      'person:alice',
      'person:bob',
    ]);
  });

  it('keeps selection attached to rows without ids after sorting', () => {
    const onSelectionChange = vi.fn();
    const rowsWithoutIds = [
      { name: 'Bravo', role: 'Admin', seats: 2 },
      { name: 'Alice', role: 'Editor', seats: 4 },
    ];
    const { container, getByRole, getByText } = render(
      <TableFactory
        schema={teamSchema}
        rows={rowsWithoutIds}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(getByRole('button', { name: /name/i }));
    fireEvent.click(getByText('Alice').closest('tr')!);

    expect(container.querySelector('[data-row-selected="true"]')).toHaveTextContent('Alice');
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      keys: ['__row_1'],
      rows: [rowsWithoutIds[1]],
    });
  });

  it('renders cell text using the field dot-path', () => {
    const nested = [
      { id: '1', name: 'Alice', profile: { role: 'Admin' }, seats: 1 },
    ];
    const schema = {
      ...teamSchema,
      properties: {
        ...teamSchema.properties,
        role: {
          ...teamSchema.properties.role,
          'x-component-props': {
            ...teamSchema.properties.role['x-component-props'],
            field: 'profile.role',
          },
        },
      },
    };
    const { getByText } = render(<TableFactory schema={schema} rows={nested} />);
    expect(getByText('Admin')).toBeInTheDocument();
  });
});
