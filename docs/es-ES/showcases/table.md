---
title: Showcase de Tabla
description: Ejemplo interactivo de TableFactory — tercera factory integrada sobre createReactFactory
aside: false
---

<script setup>
import TableShowcaseWrapper from '../../.vitepress/showcases/table/TableShowcaseWrapper.vue'
</script>

# Showcase de Tabla

`TableFactory` funcionando sobre un schema de tabla tomado de
[`instances/table/simple-table.json`](https://github.com/guynikan/schepta/blob/main/instances/table/simple-table.json).
Es la **tercera factory integrada** de Schepta, que convive con `FormFactory`
y `MenuFactory`, construida sobre la primitiva genérica `createReactFactory`
descrita en [Creando una Factory](../concepts/08-create-factory.md).

El schema describe la forma visual de la tabla (columnas, alineación,
ordenación, `format` opcional), mientras que **las filas se pasan por prop**:
es la forma idiomática de renderizar datasets reales sin inflar el schema
con datos.

Qué probar:

- **Hacer clic en el encabezado de una columna ordenable** (Name, Email, Role, Seats) →
  alterna `ascendente → descendente → sin ordenar`. El estado actual aparece
  en *"Last onSort"*.
- **Hacer clic en una fila** → alterna la selección. Este showcase usa
  `selectionMode="multiple"`, así que puede haber varias filas seleccionadas
  al mismo tiempo. El payload aparece en *"Last onSelectionChange"*.
- **"Select top 3 via ref"** → invoca `tableRef.current?.setSelectedKeys(['u1','u2','u3'])`.
- **"Sort by email desc (ref)"** → invoca `tableRef.current?.setSort({ column: 'email', direction: 'desc' })`.
- **"Clear sort (ref)"** → invoca `tableRef.current?.setSort(null)`.
- **"Snapshot visible rows (ref)"** → invoca `tableRef.current?.getVisibleRows()` y muestra
  los IDs de las filas en el orden actual.

La columna **Status** usa la plantilla opcional `format: "● {{ value }}"`
declarada en el schema — una sustitución mínima aplicada por el renderizador
por defecto de celdas.

<ClientOnly>
  <TableShowcaseWrapper />
</ClientOnly>
