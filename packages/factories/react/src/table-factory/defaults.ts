import { createComponentSpec, type ComponentSpec } from '@schepta/core';
import { DefaultTableContainer, DefaultTableColumn } from './components';

export const defaultTableComponents: Record<string, ComponentSpec> = {
  TableContainer: createComponentSpec({
    id: 'TableContainer',
    type: 'table-container',
    component: () => DefaultTableContainer,
  }),
  TableColumn: createComponentSpec({
    id: 'TableColumn',
    type: 'table-column',
    component: () => DefaultTableColumn,
  }),
};
