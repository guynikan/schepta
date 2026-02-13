# Cómo los Schemas se Convierten en Componentes

**Sistema que transforma JSON en componentes funcionales** — schema entra, interfaz sale.

<img src="/images/01-factories.svg" alt="Factories" />

**El Factory Pattern es el corazón de schepta:**

### Qué Es:

| **Input**      | **Factory**        | **Output**       | **Resultado**          | **Estado** |
| -------------- | ------------------ | ---------------- | ---------------------- | ------------ |
| Form JSON      | `FormFactory`      | React/Vue Form   | Interfaz funcionando  | Listo
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Navegación completa     | En desarrollo

### Cómo Funciona:

**Proceso Automático:**
1. **JSON Schema** define estructura y comportamiento (usando `properties` y `x-component` por nodo)
2. **Factory** interpreta el schema y resuelve componentes del registro (defaults + Provider + props locales)
3. **Middleware Pipeline** transforma props (ej. expresiones de template)
4. **React/Vue Component** renderiza la interfaz final

**Ejemplo Rápido:**
```json
{
  "type": "object",
  "x-component": "FormContainer",
  "properties": {
    "email": {
      "type": "string",
      "x-component": "InputText",
      "x-component-props": { "placeholder": "Email" }
    }
  }
}
```
↓ **FormFactory procesa**
```jsx
<form>
  <input name="email" placeholder="Email" />
</form>
```

> **Resultado:** JSON estructurado → Interfaz React/Vue funcional. ¡Cero configuración manual!

## Tipos de Factory

**Cada Factory está especializada en un tipo de interfaz:**

### FormFactory - Formularios Dinámicos:

| **Propiedad del Schema** | **Función** | **Ejemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Define la estructura del formulario (JSON Schema) | `{ "email": { ... } }` | Nodos anidados con componentes |
| `x-component` | Componente a renderizar | `"InputText"` | Input de texto |
| `x-component-props` | Props del componente | `{ "placeholder": "Email" }` | Pasadas al componente |

### MenuFactory - Navegación Dinámica:

| **Propiedad del Schema** | **Función** | **Ejemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties` | Define ítems de menú | `{ "home": {...} }` | Ítem de navegación |
| `x-component-props.href` | Enlace de navegación | `"/dashboard"` | Enlace funcional |
| `properties.submenu` | Submenú jerárquico | Propiedades anidadas | Menú desplegable |

## Arquitectura de la Factory

**Cómo funciona el Factory Pattern internamente:**

### Pipeline de Procesamiento:

```
JSON Schema
    ↓
Validar Schema (¿Estructura correcta?)
    ↓
Resolver Componentes (x-component → componente de defaults / Provider / local)
    ↓
Transformar Props (Middleware + contexto)
    ↓
Orquestar Render (Árbol final de componentes)
    ↓
Elementos React/Vue
```

### Cómo se Especializan las Factories:

**Cada Factory tiene lógica específica para su dominio:**
- **FormFactory:** Inyecta contexto del adapter de formulario, aplica validaciones, gestiona estado
- **MenuFactory:** Gestiona navegación, estados activos, jerarquía de menú

**Puntos de extensión:** `components` y `customComponents` del Provider, props de la Factory para overrides locales, Middleware Pipeline (ej. array `middlewares`), `externalContext` para estado compartido.

## Casos de Uso Prácticos

**El Factory Pattern resuelve problemas reales de desarrollo:**

### Escenarios Resueltos:

| **Situación** | **Problema Tradicional** | **Con Factory Pattern** | **Beneficio** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Formularios Repetitivos** | Copy-paste de JSX | Schema reutilizable | Principio DRY |
| **Validaciones Complejas** | Código duplicado | Reglas en el schema | Centralización |
| **Menús Dinámicos** | Condicionales hardcoded | Expresiones en props | Flexibilidad |
| **UI Multi-tenant** | Ramas por cliente | Schema por tenant | Escalabilidad |
| **A/B Testing** | Feature flags complejas | Schemas diferentes | Agilidad |

## Enlaces Esenciales

| **Para Entender** | **Leer** | **Relación con Factories** |
| ----------------- | -------- | ------------------------- |
| **Cómo escribir schemas** | [02. Schema Language](./02-schema-language.md) | Sintaxis que las factories interpretan |
| **Pipeline interno** | [04. Schema Resolution](./04-schema-resolution.md) | Cómo las factories procesan schemas |
| **Motor de renderizado** | [05. Renderer](./05-renderer.md) | Sistema usado por las factories |
| **Transformación de props** | [06. Middleware](./06-middleware.md) | Pipeline aplicado por las factories |
| **Configuración global** | [03. Provider](./03-provider.md) | Cómo configurar las factories |
