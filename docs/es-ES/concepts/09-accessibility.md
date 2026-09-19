# Accesibilidad

Schepta renderiza UI a partir de JSON, así que quien escribe el schema nunca escribe el marcado — quien decide la semántica es el componente integrado. Eso convierte la accesibilidad en una responsabilidad del framework y no de la aplicación: si un componente por defecto emite un input sin etiqueta, toda aplicación construida sobre él hereda el problema.

Los componentes React integrados apuntan a **WCAG 2.1 AA** de fábrica. Nada de lo que sigue requiere configuración.

## Lo que obtienes sin configurar nada

### Todas las factories

- **Foco visible** — se aplica un anillo `:focus-visible` a los elementos interactivos dentro de cualquier subárbol de Schepta. La mayoría de los componentes por defecto son botones sin estilo (`border: none`), donde el anillo del navegador es invisible o inexistente.
- **Movimiento reducido** — las transiciones y animaciones se desactivan bajo `prefers-reduced-motion: reduce`.
- **IDs sin colisión** — los ids vienen de `useId()` de React, así que renderizar el mismo schema dos veces en una página no rompe `label[for]` ni ninguna referencia `aria-*`.

Ambas reglas de estilo viven en la capa CSS `schepta-defaults`, inyectada por `createReactFactory`. Estar en una capa significa que tu propio CSS las sobrescribe sin `!important`.

### FormFactory

| Comportamiento | Detalle |
| --- | --- |
| Asociación de etiqueta | `<label for>` ligado a un id de control generado |
| Campos obligatorios | `required` + `aria-required` desde `x-component-props.required` |
| Campos inválidos | `aria-invalid` en cuanto el campo falla la validación |
| Mensajes de error | Renderizados junto al control, enlazados vía `aria-describedby` |
| Texto de ayuda | `x-component-props.description`, enlazado vía `aria-describedby` |
| Resumen de errores | Recibe el foco automáticamente en un envío inválido, listando cada error |
| Secciones | `<section aria-labelledby>` nombrada por su `FormSectionTitle` |
| Validación nativa | Desactivada (`noValidate`) para que los mensajes anunciados por Schepta no sean sustituidos por los globos del navegador |

La validación corre contra el schema (AJV) al enviar cuando `validateOnSubmit` está habilitado. Es opcional y el valor predeterminado es `false`.

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "Correo electrónico",
    "required": true,
    "description": "Lo usamos para iniciar tu sesión"
  }
}
```

Ese schema produce un input etiquetado y obligatorio, cuyo texto de ayuda y (tras un envío inválido) su error se anuncian ambos.

### TabsFactory

Sigue el patrón ARIA Tabs. La lista de pestañas es **un único punto de tabulación**; las flechas navegan entre pestañas, `Home` / `End` saltan a los extremos, y las pestañas deshabilitadas se omiten. El `aria-controls` de cada disparador apunta al panel que realmente está en el DOM.

Las pestañas deshabilitadas usan `aria-disabled`, no el atributo nativo `disabled` — un botón deshabilitado de forma nativa sale del árbol de accesibilidad, así que quien usa un lector de pantalla no sabría que la pestaña existe.

### ModalFactory

- El foco entra en el diálogo al abrirse y **vuelve al elemento que lo abrió** al cerrarse.
- `Tab` y `Shift+Tab` circulan dentro del diálogo; `Escape` cierra el diálogo enfocado.
- Se renderiza mediante un portal a `document.body`, así que nunca hereda el `aria-hidden` ni el contexto de apilamiento de un ancestro.
- Se nombra a sí mismo desde el título del `ModalHeader` (`aria-labelledby`) y su descripción (`aria-describedby`), con `ariaLabel` como respaldo.
- El scroll del body queda bloqueado mientras está abierto.

### TableFactory

- Con la selección habilitada la tabla pasa a `role="grid"` con `aria-multiselectable` — `aria-selected` en una fila es inválido en una `table` normal.
- Las filas usan roving tabindex: un `Tab` entra en la cuadrícula y las flechas navegan entre filas. Sin esto, una tabla de 50 filas cuesta 50 pulsaciones para saltarla.
- Los estados de carga y vacío se anuncian mediante una live region.
- Las cabeceras ordenables conservan `aria-sort` y `<th scope="col">`.

### MenuFactory

- El elemento activo lleva `aria-current="page"`.
- Los elementos deshabilitados salen del orden de tabulación, en lugar de solo no ser clicables.

### LayoutFactory

- Se renderiza un enlace de salto como primer elemento enfocable, apuntando a `#main-content`.
- El `<main>` es enfocable (`tabindex="-1"`) para que seguir el enlace mueva el foco, no solo el scroll.
- `banner` / `contentinfo` solo se reclaman cuando `isPageRoot: true`. Un `<header>` anidado dentro de un `<div>` no es un landmark, y una página con dos banners es peor que una sin ninguno.

## Sobrescribir los valores por defecto

`x-component-props` acepta cualquier prop y se propaga al elemento en último lugar, así que lo que definas ahí gana sobre el valor generado:

```json
{
  "type": "string",
  "x-component": "InputText",
  "x-component-props": {
    "label": "Buscar",
    "aria-label": "Buscar en todos los proyectos",
    "aria-keyshortcuts": "Control+K"
  }
}
```

Úsalo cuando necesites un nombre accesible concreto, una pista de atajo o un atributo ARIA que Schepta no emite. Prefiere el comportamiento integrado donde exista — un `aria-describedby` escrito a mano no se actualiza cuando cambia el estado de validación.

## Componentes personalizados

Un componente personalizado reemplaza al integrado por completo, accesibilidad incluida. Las mismas primitivas que usan los componentes por defecto están exportadas, para que no tengas que reconstruirlas:

```tsx
import {
  useFieldA11y,
  FieldMessages,
  type InputTextProps,
} from '@schepta/factory-react';

export function MyInput({ name, label, description, required, ...rest }: InputTextProps) {
  const { ids, errorText, labelProps, controlProps } = useFieldA11y({
    name,
    description,
    required,
  });

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input name={name} {...controlProps} {...rest} />
      <FieldMessages ids={ids} description={description} errorText={errorText} />
    </div>
  );
}
```

`useFieldA11y` lee el error del campo de forma reactiva desde el adaptador de formulario y devuelve el `aria-invalid` / `aria-describedby` correspondiente, para que tu componente anuncie la validación igual que los integrados.

También disponibles:

| Export | Para qué sirve |
| --- | --- |
| `useA11yIds` | IDs sin colisión para una instancia de componente |
| `composeDescribedBy` | Une candidatos a `aria-describedby`, descartando los vacíos |
| `useRovingTabIndex` | Navegación por flechas con un único punto de tabulación |
| `useFocusTrap` | Confinamiento y restauración del foco para diálogos |
| `useAnnouncer` | Live region para cambios de estado asíncronos |
| `visuallyHiddenStyle` | Oculta visualmente manteniéndolo en el árbol de accesibilidad |

## Pruebas

El repositorio protege la accesibilidad en CI en dos niveles:

- **Unitario** — `vitest-axe` ejecuta axe contra la salida de cada factory, más pruebas explícitas de teclado (`packages/factories/react/src/a11y/a11y.test.tsx`).
- **E2E** — `@axe-core/playwright` analiza cada showcase en un navegador real y ejercita las rutas de teclado (`tests/e2e/a11y.spec.ts`, proyecto `a11y`).

```bash
pnpm --filter @schepta/factory-react test
pnpm test:e2e -- --project=a11y
```

axe no puede determinar si las flechas navegan entre pestañas o si el foco está atrapado en un diálogo. Justamente esos son los fallos que dejan fuera a quien usa el teclado, así que ambas suites combinan el análisis estático con pruebas de interacción explícitas.

## Limitaciones actuales

- Los componentes por defecto de Vue y Vanilla **todavía no** han recibido este trabajo. Solo `@schepta/factory-react` cumple el contrato descrito aquí.
- El contraste de color está garantizado solo para los tokens por defecto. Si sobrescribes `--schepta-*`, verifica que el resultado se mantenga en 4.5:1.
