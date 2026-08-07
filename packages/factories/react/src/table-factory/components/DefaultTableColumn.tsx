import React from 'react';
import { useOptionalTableContext } from '../context';

export interface DefaultTableColumnProps {
  label: string;
  field: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  'data-test-id'?: string;
}

/**
 * Default renderer for a TableColumn header (`<th>`).
 *
 * The column header is schema-driven (label, align, sortable come from
 * `x-component-props`) while the *current* sort state is read from the
 * TableContext so that clicks automatically toggle the factory-managed sort
 * without requiring middleware wiring on the schema.
 */
export function DefaultTableColumn({
  label,
  sortable,
  width,
  align = 'left',
  'data-test-id': dataTestId,
}: DefaultTableColumnProps) {
  const ctx = useOptionalTableContext();
  const columnKey = dataTestId ?? '';
  const currentSort = ctx?.sort ?? null;
  const isActiveSort = !!currentSort && currentSort.column === columnKey;
  const direction = isActiveSort ? currentSort!.direction : null;

  const handleSortToggle = () => {
    if (!sortable || !ctx) return;
    ctx.onToggleSort(columnKey);
  };

  const ariaSort: 'ascending' | 'descending' | 'none' = isActiveSort
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  const headerStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: align,
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--schepta-text-2)',
    borderBottom: '1px solid var(--schepta-border)',
    background: 'var(--schepta-bg-subtle, transparent)',
    width: width,
    whiteSpace: 'nowrap',
  };

  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    color: 'inherit',
    font: 'inherit',
    textTransform: 'inherit',
    letterSpacing: 'inherit',
    cursor: sortable ? 'pointer' : 'default',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const indicator = sortable ? (
    <span
      aria-hidden="true"
      data-test-id={`${columnKey}-sort-indicator`}
      style={{
        fontSize: '10px',
        opacity: isActiveSort ? 1 : 0.35,
        transform: direction === 'desc' ? 'rotate(180deg)' : undefined,
        display: 'inline-block',
        transition: 'transform 120ms ease',
      }}
    >
      {isActiveSort ? (direction === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  ) : null;

  return (
    <th
      scope="col"
      aria-sort={sortable ? ariaSort : undefined}
      data-test-id={dataTestId}
      data-sort-active={isActiveSort || undefined}
      data-sort-direction={direction || undefined}
      style={headerStyle}
    >
      {sortable ? (
        <button type="button" onClick={handleSortToggle} style={buttonStyle}>
          <span>{label}</span>
          {indicator}
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );
}
