---
title: Table Showcase
description: Interactive TableFactory example — a third built-in factory powered by createReactFactory
aside: false
---

<script setup>
import TableShowcaseWrapper from '../../.vitepress/showcases/table/TableShowcaseWrapper.vue'
</script>

# Table Showcase

A working `TableFactory` rendering a data table schema from
[`instances/table/simple-table.json`](https://github.com/guynikan/schepta/blob/main/instances/table/simple-table.json).
It is the **third built-in factory** in Schepta, living alongside `FormFactory`
and `MenuFactory` and built on top of the generic `createReactFactory`
primitive described in [Creating a Factory](../concepts/08-create-factory.md).

The schema describes the visual shape of the table (columns, alignment,
sortability, optional `format`) while the **rows are passed in as a prop** —
this is the idiomatic way to render real-world datasets without inflating
the schema with data.

What to try:

- **Click a sortable header** (Name, Email, Role, Seats) → toggles
  `ascending → descending → unsorted`. The current sort is shown in
  *"Last onSort"*.
- **Click a row** → toggles membership in the selection. This showcase uses
  `selectionMode="multiple"`, so multiple rows can be selected at once.
  The payload is shown in *"Last onSelectionChange"*.
- **"Select top 3 via ref"** → calls `tableRef.current?.setSelectedKeys(['u1','u2','u3'])`.
- **"Sort by email desc (ref)"** → calls `tableRef.current?.setSort({ column: 'email', direction: 'desc' })`.
- **"Clear sort (ref)"** → calls `tableRef.current?.setSort(null)`.
- **"Snapshot visible rows (ref)"** → calls `tableRef.current?.getVisibleRows()` and shows the
  row IDs in the current sort order.

The **Status** column uses the optional `format: "● {{ value }}"` template
declared in the schema — a minimal string substitution applied by the
default cell renderer.

<ClientOnly>
  <TableShowcaseWrapper />
</ClientOnly>
