# El Motor de Renderizado

**Sistema que controla cómo se renderiza cada tipo de componente** — el "puente" entre componentes React/Vue y la lógica de presentación.

<img src="/images/05-renderer.svg" alt="Renderer" />

**El sistema de Renderer decide qué wrapper usar para cada tipo de componente:**

### Qué Son los Renderers:

| **Tipo de Renderer** | **Función** | **Usado Para** | **Ejemplo** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renderiza campos de formulario | InputText, Select, etc. | Vincula al adapter de formulario, pasa props |
| **button** | Renderiza botones | SubmitButton | Comportamiento de botón |
| **container** | Renderiza contenedores de formulario | FormGroup, Section | Organiza layout |
| **content** | Renderiza contenido estático | Títulos, labels | Visualización simple |
| **menu-item** | Renderiza ítems de menú | MenuLink, MenuButton | Navegación (cuando se usa MenuFactory) |
| **menu-container** | Renderiza contenedores de menú | MenuContainer | Jerarquía de menú |
| **addon** | Renderiza addons | UI de complemento | Contenido suplementario |

### Cómo Funcionan:

**Componente → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + binding de formulario + props
```

**El Renderer Añade:**
- **Binding con adapter de formulario** (ej. value, onChange del contexto de formulario Schepta)
- **Inyección de contexto** (valores del formulario, contexto externo)
- **Transformación de props** específica por tipo

> **Resultado:** ¡Componentes enfocados en la UI, Renderers en la lógica de presentación!


## Tipos de Renderer

### Field Renderer - Campos de Formulario:

| **Responsabilidad** | **Implementación** | **Beneficio** |
| -------------------- | ----------------- | ------------- |
| **Integración con formulario** | Adapter de formulario (ej. useScheptaFormAdapter en React) | value y onChange ligados al estado del formulario |
| **Props** | Recibe name, component, componentProps | Renderizado consistente de campos |
| **Renderers customizados** | Override vía `renderers.field` | Usar con React Hook Form, Formik, etc. |

### Container Renderer - Layout y Organización:

| **Responsabilidad** | **Implementación** | **Beneficio** |
| -------------------- | ----------------- | ------------- |
| **Orden de hijos** | Ordenación por `x-ui.order` | Layout automático |
| **Filtrado de props** | Quitar props de contenedor | Props limpias |
| **Gestión de secciones** | Agrupar ítems relacionados | Organización visual |

### Content y Button Renderers:

- **content:** Contenido estático (títulos, texto). Procesamiento mínimo.
- **button:** Componentes de botón (ej. SubmitButton). Tipo `button` en la spec del componente.


## Cómo Funciona el Sistema

### Pipeline de Resolución:

```
Schema JSON
    ↓
Detectar Tipo (tipo de la spec: field, container, button, content, ...)
    ↓
Elegir Renderer (Default → renderers de ScheptaProvider → renderers de la Factory)
    ↓
Preparar Props (Merge + contexto)
    ↓
Aplicar Middleware (ej. expresiones de template)
    ↓
Renderizar (Renderer envuelve el componente)
    ↓
Elemento React/Vue Final
```

### Jerarquía de Resolución:

**Cómo el sistema elige qué renderer usar:**

| **Prioridad** | **Fuente** | **Cuándo Usar** | **Ejemplo** |
| -------------- | --------- | --------------- | ----------- |
| **1ª - Default** | Built-in de la factory | Comportamiento por defecto | DefaultFieldRenderer para tipo `field` |
| **2ª - Global** | ScheptaProvider | Por defecto de la aplicación | `<ScheptaProvider renderers={{ field: AppFieldRenderer }} />` |
| **3ª - Local** | Props de la factory | Override por factory | `<FormFactory renderers={{ field: CustomField }} />` |

No existe una API separada "registerRenderer"; los renderers vienen de los defaults de la factory, luego de los `renderers` del Provider, luego de la prop `renderers` de la factory.


## Por Qué Existen los Renderers

**Separación de responsabilidades:**
- **Componentes** definen la UI (input, botón, contenedor).
- **Renderers** los envuelven con binding de formulario, layout u otro comportamiento. El field renderer por defecto usa el adapter de formulario de Schepta para que los campos funcionen sin una biblioteca de formularios específica; puedes reemplazarlo por un renderer custom que use React Hook Form o Formik.


## Conceptos Relacionados

**Los renderers son el "motor" que conecta otros conceptos:**

- **[01. Factories](./01-factories.md):** Las factories usan renderers para procesar cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** El pipeline de resolución detecta qué renderer usar  
- **[06. Middleware](./06-middleware.md):** El pipeline corre antes/durante el render
- **[03. Provider](./03-provider.md):** Configura renderers globalmente vía prop `renderers`
- **[07. Debug System](./07-debug-system.md):** Debug puede mostrar qué renderer se eligió
