# De JSON a Componentes

**Sistema que interpreta schemas JSON y los transforma en elementos React/Vue** — el "traductor" entre backend y frontend.

<img src="/images/04-schema-resolution.svg" alt="Schema Resolution" />

**Schema Resolution es el proceso que transforma configuraciones JSON en interfaces funcionales:**

### Qué Hace:

| **Entrada** | **Proceso** | **Salida** | **Resultado** |
| --------- | ------------ | ---------- | ------------- |
| JSON Schema | Resolución + Validación | Árbol de Elementos React/Vue | Interfaz renderizada |
| Especificaciones de componente | Lookup (defaults + Provider + local) | Instancias de componentes | Componentes funcionando |
| Props y contexto | Pipeline de middleware | Props enriquecidas | Comportamiento correcto |

### Flujo de Resolución:

**Pasos Automáticos:**
1. **Parsing del Schema:** JSON → Estructura interna
2. **Lookup de Componente:** `x-component` (y opcional `x-custom`) → Componente del registro mezclado
3. **Resolución de Props:** Propiedades del schema → Props del componente
4. **Inyección de Contexto:** Adapter de formulario, contexto externo → disponibles para los componentes
5. **Aplicación de Middleware:** Transformación de props (ej. expresiones de template)
6. **Creación de Elemento:** React.createElement() / Vue h()

**Ejemplo Visual:**
```json
{ "name": "email", "x-component": "InputText", "required": true }
```
↓ **Proceso de Resolución**
```jsx
<InputText name="email" required={true} onChange={...} />
```

> **Resultado:** Schema declarativo → Componente imperativo.


## Tipos de Resolución

### Resolución de Schema de Formulario:

| **Propiedad del Schema** | **Estrategia de Resolución** | **Resultado React/Vue** | **Ejemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `name` | Identificación del campo | prop `name` | `<input name="email" />` |
| `x-component` | Lookup de componente en registro mezclado | Tipo del componente | `<InputText />` |
| `required` | Regla de validación | prop `required` + validación | `required={true}` |
| `x-component-props` | Paso de props (tras procesamiento de template) | Props directas | `placeholder="Introduce email"` |
| `x-rules` | Configuración de validación | Props de validación | `pattern="email"` |

### Resolución de Schema de Componente:

| **Propiedad del Schema** | **Estrategia de Resolución** | **Resultado React/Vue** | **Ejemplo** |
| ------------------- | ----------------------- | ---------------- | ----------- |
| `x-component` | Lookup del tipo de componente | Clase del componente | `<Button />` |
| `x-ui` | Props de layout/estilo | Pasadas al componente | Props de layout |
| `x-component-props` | Props específicas del componente (expresiones de template resueltas) | Objeto de props | `{ variant: "primary" }` |


## Motor de Resolución

**Cómo el sistema resuelve schemas internamente:**

### Pipeline de Resolución:

```
JSON Schema bruto
    ↓
Validar Schema (¿Estructura válida?)
    ↓
Resolver Componente (Lookup: customComponents para x-custom, si no components mezclados)
    ↓
Mapear Props (Schema → Props del componente)
    ↓
Inyectar Contexto (formValues, externalContext)
    ↓
Aplicar Middleware (ej. expresiones de template)
    ↓
Crear Elemento (React.createElement / Vue h())
    ↓
Elemento React/Vue Final
```

### Prioridades de Resolución:

**Resolución de Componentes:**
- Cuando un nodo del schema tiene `x-custom: true`, el resolvedor busca la clave del nodo en **customComponents** (Provider / factory).
- Si no, el nombre del componente (`x-component` o clave del nodo) se busca en el registro **merged components**. Orden del merge: **Default (factory) → Global (ScheptaProvider) → Local (props de la factory)**. Lo que venga después sobrescribe.

**Orden de Resolución de Props:**
1. **Props definidas en el schema** (`x-component-props`, etc.), con expresiones de template resueltas
2. **Props derivadas** (de la estructura del schema, ej. nombre del campo)
3. **Contexto** (adapter de formulario, externalContext) disponible para los componentes
4. **Props por defecto** (defaults del componente)

**Orden de Resolución de Middleware:**
- El middleware de expresiones de template corre primero (así `{{ $formValues.x }}` y `{{ $externalContext.x }}` se resuelven).
- Luego **`middlewares` del Provider** y **`middlewares` de la factory** corren en el orden del array.


## Resolución de Expresiones

**Las expresiones de template en las props se resuelven usando valores del formulario y contexto externo:**

| **Tipo de Expresión**   | **Resolución** | **Ejemplo** | **Resultado** |
| --------------------- | --------------- | ----------- | ---------- |
| **Valores estáticos**     | Directo          | `"required": true` | `required={true}` |
| **Valores del formulario**       | `$formValues`   | `"{{ $formValues.email }}"` | Valor actual del campo |
| **Contexto externo**  | `$externalContext` | `"{{ $externalContext.user.name }}"` | Valor del externalContext del Provider |
| **Expresiones JEXL**  | Evaluadas       | `"{{ $formValues.age >= 18 }}"` | boolean |


## Conceptos Relacionados

**Schema Resolution es el "procesador" que conecta schemas con React/Vue:**

- **[01. Factories](./01-factories.md):** Las factories usan la resolución para procesar schemas
- **[02. Schema Language](./02-schema-language.md):** Sintaxis interpretada por la resolución  
- **[05. Renderer](./05-renderer.md):** Renderers elegidos por la resolución
- **[06. Middleware](./06-middleware.md):** Pipeline ejecutado durante la resolución
- **[03. Provider](./03-provider.md):** Contexto y configuración usados en la resolución
- **[07. Debug System](./07-debug-system.md):** Debug muestra los pasos de la resolución
