import React from 'react';
import { useOptionalTableContext, type TableColumnMeta } from '../context';
import { useRovingTabIndex, visuallyHiddenStyle } from '../../a11y';

export interface DefaultTableContainerProps {
  ariaLabel?: string;
  caption?: string;
  children?: React.ReactNode;
  'data-test-id'?: string;
}

/**
 * Reads a dot-path (e.g. `user.email`) from a row, returning `undefined` when
 * any intermediate segment is missing.
 */
function readPath(row: Record<string, any>, path: string): any {
  if (!path) return undefined;
  const segments = path.split('.');
  let current: any = row;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

/**
 * Applies a `format` template string to a raw cell value. The only token
 * supported by the MVP default renderer is `{{ value }}`.
 */
function formatCellValue(raw: any, format: string | undefined): string {
  const stringified = raw === null || raw === undefined ? '' : String(raw);
  if (!format) return stringified;
  return format.replace(/\{\{\s*value\s*\}\}/g, stringified);
}

function renderCell(row: Record<string, any>, column: TableColumnMeta): React.ReactNode {
  const raw = readPath(row, column.field);
  return formatCellValue(raw, column.format);
}

export function DefaultTableContainer({
  ariaLabel,
  caption,
  children,
  'data-test-id': dataTestId,
}: DefaultTableContainerProps) {
  const ctx = useOptionalTableContext();

  // Hooks run unconditionally; safe defaults cover the missing-context case,
  // which bails out on render below.
  const rows = ctx?.rows ?? [];
  const selectionMode = ctx?.selectionMode ?? 'none';
  const isRowSelectable = selectionMode !== 'none';

  const { getTabIndex, registerItem, onKeyDown, onItemFocus } = useRovingTabIndex({
    itemCount: rows.length,
    orientation: 'vertical',
    activeIndex: 0,
    loop: false,
  });

  if (!ctx) {
    return (
      <div
        role="alert"
        style={{
          padding: '12px',
          border: '1px solid var(--schepta-error-border)',
          color: 'var(--schepta-error-text)',
          borderRadius: '4px',
        }}
      >
        DefaultTableContainer must be rendered by TableFactory (missing
        TableContext).
      </div>
    );
  }

  const {
    columns,
    selectedKeys,
    loading,
    emptyState,
    getRowKey,
    onToggleRow,
  } = ctx;

  const selectedSet = new Set(selectedKeys);
  const hasRows = rows.length > 0;

  const wrapperStyle: React.CSSProperties = {
    border: '1px solid var(--schepta-border)',
    borderRadius: '6px',
    overflow: 'hidden',
    background: 'var(--schepta-bg)',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    color: 'var(--schepta-text-1)',
  };

  const bodyRowStyle = (isSelected: boolean, isClickable: boolean): React.CSSProperties => ({
    cursor: isClickable ? 'pointer' : 'default',
    background: isSelected ? 'var(--schepta-bg-selected, rgba(99, 102, 241, 0.08))' : 'transparent',
    borderBottom: '1px solid var(--schepta-border-subtle, rgba(0,0,0,0.06))',
  });

  const cellStyle = (column: TableColumnMeta): React.CSSProperties => ({
    padding: '10px 12px',
    textAlign: column.align ?? 'left',
    width: column.width,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });

  const handleRowClick = (rowKey: string) => {
    if (!isRowSelectable) return;
    onToggleRow(rowKey);
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, rowKey: string) => {
    if (!isRowSelectable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleRow(rowKey);
    }
  };

  const defaultEmptyState = (
    <span style={{ color: 'var(--schepta-text-3)' }}>No rows to display</span>
  );

  return (
    <div data-schepta-table="true" data-test-id={dataTestId} style={wrapperStyle}>
      {/*
        Loading and empty states change without user input, so they are
        announced through a live region. The visual message still lives in the
        table body — this only carries the announcement.
      */}
      <div role="status" aria-live="polite" style={visuallyHiddenStyle}>
        {loading ? 'Loading rows' : !hasRows ? 'No rows to display' : ''}
      </div>
      <table
        // `aria-selected` on a row is only valid inside a grid. A plain
        // `table` with selectable rows is an ARIA violation, so the role is
        // promoted exactly when selection is enabled.
        role={isRowSelectable ? 'grid' : undefined}
        aria-multiselectable={selectionMode === 'multiple' || undefined}
        aria-label={ariaLabel || 'Table'}
        aria-busy={loading || undefined}
        aria-rowcount={hasRows ? rows.length : undefined}
        style={tableStyle}
      >
        {caption ? (
          <caption
            style={{
              captionSide: 'top',
              padding: '10px 12px',
              textAlign: 'left',
              fontWeight: 600,
              color: 'var(--schepta-text-1)',
            }}
          >
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr>{children}</tr>
        </thead>
        <tbody data-test-id="table-body">
          {loading ? (
            <tr data-test-id="table-loading-row">
              <td
                colSpan={columns.length || 1}
                style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--schepta-text-3)' }}
              >
                Loading…
              </td>
            </tr>
          ) : !hasRows ? (
            <tr data-test-id="table-empty-row">
              <td
                colSpan={columns.length || 1}
                style={{ padding: '16px 12px', textAlign: 'center' }}
              >
                {emptyState ?? defaultEmptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const rowKey = getRowKey(row, rowIndex);
              const isSelected = selectedSet.has(rowKey);
              return (
                <tr
                  key={rowKey}
                  ref={isRowSelectable ? registerItem(rowIndex) : undefined}
                  data-test-id={`row-${rowKey}`}
                  data-row-key={rowKey}
                  data-row-selected={isSelected || undefined}
                  aria-selected={isRowSelectable ? isSelected : undefined}
                  // Roving tabindex: the grid is a single tab stop and the
                  // up/down arrows move between rows. Making every row a tab
                  // stop would mean one Tab press per row to get past the
                  // table.
                  tabIndex={isRowSelectable ? getTabIndex(rowIndex) : undefined}
                  onFocus={isRowSelectable ? () => onItemFocus(rowIndex) : undefined}
                  onClick={() => handleRowClick(rowKey)}
                  onKeyDown={(event) => {
                    handleRowKeyDown(event, rowKey);
                    if (!event.defaultPrevented) onKeyDown(event);
                  }}
                  style={bodyRowStyle(isSelected, isRowSelectable)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-test-id={`cell-${rowKey}-${column.key}`}
                      style={cellStyle(column)}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
