# Transformación de Props

**Sistema que intercepta y modifica props antes del renderizado** — el "filtro inteligente" entre schema y componente.

<img src="/images/06-middleware.svg" alt="Middleware" />


**El Pipeline de Middleware permite modificar el comportamiento de componentes sin cambiar código:**

### 🔧 Qué Hace:

| **Entrada** | **Middleware** | **Transformación** | **Salida** |
| --------- | -------------- | ------------------ | ---------- |
| Props crudas del schema | `withValidation` | Añade reglas de validación | Props con validación |
| Valores crudos | `withFormatting` | Formatea CPF, teléfono, etc. | Valores formateados |
| Props básicas | `withConditional` | Aplica reglas de visibilidad | Props condicionales |
| Props de componente | `withCustomLogic` | Lógica de negocio específica | Props finales |

### 📊 Flujo del Pipeline:

**Ejecución Secuencial:**
```text
Props Crudas → Middleware 1 → Middleware 2 → Middleware N → Props Finales → Componente
```

**Ejemplo Práctico:**
```typescript
// Entrada
{ name: "cpf", value: "12345678901", required: true }

// Pipeline de Middleware
→ withFormatting: formatea CPF
→ withValidation: añade validación
→ withCustomLogic: añade reglas de negocio

// Salida  
{ name: "cpf", value: "123.456.789-01", required: true, pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/, onValidate: validateCPF }
```

> **💡 Resultado:** Props básicas → Props enriquecidas. ¡Funcionalidad sin código duplicado!


## 🚀 Tipos de Middleware

**Cada middleware tiene una responsabilidad específica:**

### 🛡️ Middleware de Validación:

| **Función** | **Entrada** | **Transformación** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Campos Requeridos** | `required: true` | Añade validador | Campo requerido |
| **Validación de Patrón** | `pattern: "email"` | Validación regex | Email válido |
| **Reglas Personalizadas** | `x-rules: { minLength: 8 }` | Validación de negocio | Reglas específicas |
| **Cross-Field** | Referencias de múltiples campos | Dependencia de campo | Validación entre campos |

### 🎨 Middleware de Formateo:

| **Función** | **Entrada** | **Transformación** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **CPF/CNPJ** | `type: "cpf"` | Formateo de máscara | `123.456.789-01` |
| **Teléfono** | `type: "phone"` | Formateo de teléfono | `(11) 99999-9999` |
| **Moneda** | `type: "currency"` | Formateo de dinero | `$1,234.56` |
| **Fecha** | `type: "date"` | Formateo de fecha | `mm/dd/yyyy` |

### 🎯 Middleware Condicional:

| **Función** | **Entrada** | **Transformación** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Visibilidad** | `visible: "\{\{ expression \}\}"` | Lógica mostrar/ocultar | Componente visible/oculto |
| **Estado Deshabilitado** | `disabled: "\{\{ condition \}\}"` | Habilitar/deshabilitar | Componente habilitado/deshabilitado |
| **Props Dinámicas** | `props: "\{\{ context \}\}"` | Props basadas en contexto | Props dinámicas |
| **Basado en Rol** | `roles: ["admin"]` | Verificación de permisos | Componente por permiso |

### 🔧 Middleware de Negocio Personalizado:

| **Función** | **Entrada** | **Transformación** | **Resultado** |
| ---------- | ----------- | ----------------- | ------------- |
| **Audit Logging** | Cualquier componente | Añade logging | Auditoría automática |
| **Analytics** | Interacciones de usuario | Añade tracking | Métricas de uso |
| **Caché** | Operaciones costosas | Añade memoización | Rendimiento mejorado |
| **Error Boundary** | Errores de componente | Añade manejo de errores | Mayor resiliencia |


## ⚙️ Arquitectura del Pipeline

**Cómo funciona el sistema de middleware internamente:**

### 📋 Flujo de Ejecución:

| **Etapa** | **Entrada** | **Proceso** | **Salida** | **Estrategia de Error** |
| --------- | --------- | ----------- | ---------- | ------------------ |
| **1. Registro de Middleware** | Lista de middleware | Ordenar por prioridad | Pipeline ordenado | Omitir middleware inválido |
| **2. Preparación de Props** | Props crudas del schema | Normalizar props | Props estándar | Usar predeterminados |
| **3. Ejecución del Pipeline** | Props + middleware | Transformación secuencial | Props mejoradas | Omitir middleware fallido |
| **4. Validación de Props** | Props finales | Validar tipos de props | Props válidas | Filtrar props inválidas |
| **5. Inyección de Componente** | Componente + props | Inyección de props | Componente listo | Error boundary |

### 🎯 Interfaz de Middleware:

**Firma Estándar de Middleware:**
```typescript
type Middleware = (
  props: ComponentProps,
  schema: SchemaNode,
  context: RenderContext
) => ComponentProps | Promise<ComponentProps>;
```

**Registro de Middleware:**
```typescript
const middleware = {
  // Middleware integrado (siempre ejecutado)
  withValidation: validationMiddleware,
  withFormatting: formattingMiddleware,
  
  // Middleware personalizado (basado en prioridad)
  withBusinessLogic: customBusinessMiddleware,
  withAnalytics: analyticsMiddleware
};
```

**Sistema de Prioridad:**
```typescript
const middlewareOrder = [
  'withFormatting',    // Prioridad: 1 (ejecutar primero)
  'withValidation',    // Prioridad: 2
  'withConditional',   // Prioridad: 3
  'withBusinessLogic', // Prioridad: 4
  'withAnalytics'      // Prioridad: 5 (ejecutar último)
];
```


## 📊 Patrones de Middleware

**Patrones comunes de implementación de middleware:**

### 🔧 Patrones de Transformación:

| **Patrón** | **Propósito** | **Implementación** | **Ejemplo** |
| ----------- | ----------- | ------------------ | ----------- |
| **Enhancer** | Añadir funcionalidad | `props => ({ ...props, newFeature })` | Añadir validación |
| **Filter** | Eliminar/modificar props | `props => omit(props, 'sensitiveData')` | Filtrado de seguridad |
| **Mapper** | Transformar valores | `props => ({ ...props, value: transform(props.value) })` | Formatear valores |
| **Conditional** | Aplicar condicionalmente | `(props, schema, context) => condition ? enhance(props) : props` | Características basadas en rol |

### 🎯 Patrones de Composición:

**Higher-Order Middleware:**
```typescript
const withLogging = (middleware) => (props, schema, context) => {
  console.log('Antes:', props);
  const result = middleware(props, schema, context);
  console.log('Después:', result);
  return result;
};
```

**Cadena de Middleware Asíncrona:**
```typescript
const asyncPipeline = async (props, middleware) => {
  return middleware.reduce(async (propsPromise, middleware) => {
    const currentProps = await propsPromise;
    return middleware(currentProps, schema, context);
  }, Promise.resolve(props));
};
```

**Middleware Condicional:**
```typescript
const conditionalMiddleware = (condition, middleware) => 
  (props, schema, context) => 
    condition(props, schema, context) ? middleware(props, schema, context) : props;
```


## 💡 Conceptos Relacionados

**El Pipeline de Middleware es el "procesador de props" usado por otros conceptos:**

- **[01. Factories](./01-factories.md):** Las factories ejecutan pipeline para cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** La resolución aplica pipeline durante el procesamiento  
- **[05. Renderer](./05-renderer.md):** Los renderers tienen pipeline específico del tipo
- **[02. Schema Language](./02-schema-language.md):** Propiedades del schema transformadas por middleware
- **[03. Provider](./03-provider.md):** El Provider registra middleware global
- **[07. Debug System](./07-debug-system.md):** Debug muestra middleware aplicado

