# Cómo los Schemas se Convierten en Componentes

**Sistema que transforma JSON en componentes funcionales** — schema entra, interfaz sale.

<img src="/images/01-factories.svg" alt="Factories" />

**El patrón Factory es el corazón de schepta:**

### 🔧 Qué Es:

| **Entrada**      | **Factory**        | **Salida**       | **Resultado**          | **Status** |
| -------------- | ------------------ | ---------------- | ---------------------- | ------------ |
| Form JSON      | `FormFactory`      | React/Vue Form   | Interfaz funcional  | ✅ Listo
| Menu JSON      | `MenuFactory`      | React/Vue Navigation | Navegación completa     | 🚧 Em desenvolvimento

### 📊 Cómo Funciona:

**Proceso Automático:**
1. **JSON Schema** define estructura y comportamiento
2. **Factory** interpreta schema y resuelve componentes
3. **Component Registry** proporciona componentes React/Vue para renderizar
4. **Middleware Pipeline** transforma props
5. **React/Vue Component** renderiza interfaz final

**Ejemplo Rápido:**
```json
{ "fields": [{ "name": "email", "x-component": "InputEmail" }] }
```
↓ **FormFactory procesa**
```jsx
<input type="email" name="email" />
```

> **💡 Resultado:** JSON estructurado → Interfaz React/Vue funcional. ¡Cero configuración manual!

## 🚀 Tipos de Factory

**Cada Factory está especializada en un tipo de interfaz:**

### 📝 FormFactory - Formularios Dinámicos:

| **Propiedad del Schema** | **Función** | **Ejemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `fields[]` | Define campos del formulario | `[{ name: "email" }]` | Campo de email |
| `x-component` | Tipo de entrada | `"InputText"` | Entrada de texto |
| `required` | Validación requerida | `true` | Campo requerido |
| `x-rules` | Validaciones personalizadas | `{ minLength: 8 }` | Validación de longitud |

### 🧭 MenuFactory - Navegación Dinámica:

| **Propiedad del Schema** | **Función** | **Ejemplo** | **Resultado** |
| ------------------- | ---------- | ----------- | ------------- |
| `properties{}` | Define elementos del menú | `{ "home": {...} }` | Elemento de navegación |
| `x-component-props.href` | Enlace de navegación | `"/dashboard"` | Enlace funcional |
| `active` | Control de visibilidad | `"\{\{ $segment.role === 'admin' \}\}"` | Menú basado en permisos |
| `properties.submenu` | Submenú jerárquico | Propiedades anidadas | Menú desplegable |

## ⚙️ Arquitectura de Factory

**Cómo funciona el patrón Factory internamente:**

### 🔄 Pipeline de Procesamiento:

```
JSON Schema
    ↓
Validar Schema (¿Estructura correcta?)
    ↓
Resolver Componentes (x-component → componente React/Vue)
    ↓
Transformar Props (Middleware + contexto)
    ↓
Orquestar Render (Árbol de componentes final)
    ↓
Elementos React/Vue
```

### 🎯 Cómo se Especializan las Factories:

**Cada Factory tiene lógica específica para su dominio:**
- **FormFactory:** Inyecta FormContext, aplica validaciones, gestiona estado
- **MenuFactory:** Gestiona navegación, estados activos, jerarquía de menú

**Puntos de extensión:** Component Registry (global/local), Middleware Pipeline (transformaciones personalizadas), Context Providers (estado específico del dominio).

## 📊 Casos de Uso Prácticos

**El patrón Factory resuelve problemas reales de desarrollo:**

### 🎯 Escenarios Resueltos:

| **Situación** | **Problema Tradicional** | **Con Factory Pattern** | **Beneficio** |
| ------------ | ----------------------- | ----------------------- | ------------- |
| **Formularios Repetitivos** | Copiar-pegar JSX | Schema reutilizable | Principio DRY |
| **Validaciones Complejas** | Código duplicado | Reglas en schema | Centralización |
| **Menús Dinámicos** | Condicionales hardcodeados | Expresiones `visible` | Flexibilidad |
| **UI Multi-tenant** | Ramas por cliente | Schema por tenant | Escalabilidad |
| **A/B Testing** | Feature flags complejos | Schemas diferentes | Agilidad |

## 🔗 Enlaces Esenciales

| **Para Entender** | **Lee** | **Relación con Factories** |
| ----------------- | -------- | ------------------------- |
| **Cómo escribir schemas** | [02. Schema Language](./02-schema-language.md) | Sintaxis que las factories interpretan |
| **Pipeline interno** | [04. Schema Resolution](./04-schema-resolution.md) | Cómo las factories procesan schemas |
| **Motor de renderizado** | [05. Renderer](./05-renderer.md) | Sistema usado por las factories |
| **Transformaciones de props** | [06. Middleware](./06-middleware.md) | Pipeline aplicado por las factories |
| **Configuración global** | [03. Provider](./03-provider.md) | Cómo configurar factories |

