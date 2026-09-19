import React, { useMemo, useRef, useState } from 'react';
import {
  TableFactory,
  type TableFactoryRef,
  type TableSelectionPayload,
  type TableSortState,
} from '@schepta/factory-react';
import simpleTableSchema from '../../../../instances/table/simple-table.json';

interface TableShowcaseProps {
  isDark?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'invited' | 'disabled';
  seats: number;
}

const sampleRows: TeamMember[] = [
  { id: 'u1', name: 'Alice Rodrigues', email: 'alice@acme.dev', role: 'Admin', status: 'active', seats: 5 },
  { id: 'u2', name: 'Bruno Martins', email: 'bruno@acme.dev', role: 'Editor', status: 'active', seats: 3 },
  { id: 'u3', name: 'Camila Souza', email: 'camila@acme.dev', role: 'Editor', status: 'invited', seats: 2 },
  { id: 'u4', name: 'Diego Lima', email: 'diego@acme.dev', role: 'Viewer', status: 'active', seats: 1 },
  { id: 'u5', name: 'Eva Costa', email: 'eva@acme.dev', role: 'Admin', status: 'disabled', seats: 4 },
  { id: 'u6', name: 'Fernanda Dias', email: 'fernanda@acme.dev', role: 'Editor', status: 'active', seats: 2 },
  { id: 'u7', name: 'Gustavo Pires', email: 'gustavo@acme.dev', role: 'Viewer', status: 'invited', seats: 1 },
  { id: 'u8', name: 'Helena Vaz', email: 'helena@acme.dev', role: 'Editor', status: 'active', seats: 3 },
];

export function TableShowcase({ isDark = false }: TableShowcaseProps) {
  const tableRef = useRef<TableFactoryRef>(null);
  const [lastSelection, setLastSelection] = useState<TableSelectionPayload | null>(null);
  const [lastSort, setLastSort] = useState<TableSortState | null>(null);
  const [visibleRowsSnapshot, setVisibleRowsSnapshot] = useState<TeamMember[] | null>(null);

  const handleSelectionChange = (payload: TableSelectionPayload) => {
    setLastSelection(payload);
  };

  const handleSort = (sort: TableSortState | null) => {
    setLastSort(sort);
  };

  const handleClearSelection = () => {
    tableRef.current?.setSelectedKeys([]);
  };

  const handleSelectTopThreeViaRef = () => {
    tableRef.current?.setSelectedKeys(['u1', 'u2', 'u3']);
  };

  const handleSortByEmailDescViaRef = () => {
    tableRef.current?.setSort({ column: 'email', direction: 'desc' });
  };

  const handleClearSortViaRef = () => {
    tableRef.current?.setSort(null);
  };

  const handleSnapshotVisibleRows = () => {
    const visible = (tableRef.current?.getVisibleRows() ?? []) as TeamMember[];
    setVisibleRowsSnapshot(visible);
  };

  const layout: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
      padding: '24px',
      border: '1px solid var(--schepta-border, #cccccc)',
      borderRadius: '8px',
      background: 'var(--schepta-bg, transparent)',
      color: 'var(--schepta-text-1, inherit)',
    }),
    []
  );

  const panel: React.CSSProperties = useMemo(
    () => ({ display: 'flex', flexDirection: 'column', gap: '12px' }),
    []
  );

  const button: React.CSSProperties = useMemo(
    () => ({
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid var(--schepta-border, #cccccc)',
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      fontSize: '13px',
    }),
    []
  );

  const box: React.CSSProperties = useMemo(
    () => ({
      padding: '12px',
      borderRadius: '4px',
      background: 'var(--vp-code-bg, rgba(0,0,0,0.05))',
      color: 'inherit',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      minHeight: '40px',
    }),
    []
  );

  return (
    <div data-test-id="table-showcase" data-theme={isDark ? 'dark' : 'light'} style={layout}>
      <TableFactory
        ref={tableRef}
        schema={simpleTableSchema as any}
        rows={sampleRows}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        onSort={handleSort}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          data-test-id="table-clear-selection"
          onClick={handleClearSelection}
          style={button}
        >
          Clear selection
        </button>
        <button
          type="button"
          data-test-id="table-select-top3"
          onClick={handleSelectTopThreeViaRef}
          style={button}
        >
          Select top 3 via ref
        </button>
        <button
          type="button"
          data-test-id="table-sort-email-desc"
          onClick={handleSortByEmailDescViaRef}
          style={button}
        >
          Sort by email desc (ref)
        </button>
        <button
          type="button"
          data-test-id="table-clear-sort"
          onClick={handleClearSortViaRef}
          style={button}
        >
          Clear sort (ref)
        </button>
        <button
          type="button"
          data-test-id="table-snapshot-rows"
          onClick={handleSnapshotVisibleRows}
          style={button}
        >
          Snapshot visible rows (ref)
        </button>
      </div>

      <section style={panel}>
        <div>
          <h4 style={{ margin: '0 0 4px' }}>Last onSort</h4>
          <pre data-test-id="table-last-sort" style={box}>
            {lastSort ? JSON.stringify(lastSort) : 'unsorted'}
          </pre>
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px' }}>Last onSelectionChange</h4>
          <pre data-test-id="table-last-selection" style={box}>
            {lastSelection ? JSON.stringify(lastSelection, null, 2) : 'No selection yet'}
          </pre>
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px' }}>Visible rows (ref snapshot)</h4>
          <pre data-test-id="table-visible-rows" style={box}>
            {visibleRowsSnapshot
              ? JSON.stringify(
                  visibleRowsSnapshot.map((row) => row.id),
                  null,
                  2
                )
              : 'No snapshot yet'}
          </pre>
        </div>

        <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>
          This showcase is powered by <code>TableFactory</code> — the third
          built-in factory built on top of <code>createReactFactory</code>.
          The schema lives in <code>instances/table/simple-table.json</code>.
        </p>
      </section>
    </div>
  );
}
