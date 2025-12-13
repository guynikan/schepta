# El Motor de Renderizado

**Sistema que controla cómo se renderiza cada tipo de componente** — el "puente" entre componentes React/Vue y lógica de presentación.

<img src="/images/05-renderer.svg" alt="Renderer" />


**El Sistema de Renderer decide qué wrapper usar para cada tipo de componente:**

### 🔧 Qué Son los Renderers:

| **Tipo de Renderer** | **Función** | **Usado Para** | **Ejemplo** |
| ----------------- | ---------- | -------------- | ----------- |
| **field** | Renderiza campos de formulario | InputText, Select, etc. | Añade validación automática |
| **container** | Renderiza contenedores de formulario | FormGroup, Section | Organiza layout |
| **menu-item** | Renderiza elementos de menú | MenuLink, MenuButton | Añade navegación |
| **menu-container** | Renderiza contenedores de menú | MenuContainer | Organiza jerarquía |
| **content** | Renderiza contenido estático | Text, Image | Visualización simple |

### 📊 Cómo Funcionan:

**Componente → Renderer → DOM**
```text
InputText Component → FieldRenderer → <input> + validación + props
```

**El Renderer Añade:**
- Pipeline de **middleware** automático  
- **Inyección de contexto** (formulario, menú)
- **Transformación de props** específica del tipo
- **Error boundaries** integrados

> **💡 Resultado:** ¡Los componentes se enfocan en UI, los Renderers se enfocan en lógica de presentación!


## 🚀 Tipos de Renderer

**Cada tipo de renderer tiene responsabilidades específicas:**

### 📝 Field Renderer - Campos de Formulario:

| **Responsabilidad** | **Implementación** | **Beneficio** |
| -------------------- | ----------------- | ------------- |
| **Integración de Formulario** | useFormContext() automático | Props de formulario inyectadas |
| **Pipeline de Validación** | withCpfValidation, withRules | Validación automática |
| **Props Dinámicas** | useReactions() | Props cambian basadas en estado |
| **Integración de Debug** | useDebug() | Debug visual automático |

### 🏗️ Container Renderer - Layout y Organización:

| **Responsabilidad** | **Implementación** | **Beneficio** |
| -------------------- | ----------------- | ------------- |
| **Ordenamiento de Hijos** | Ordenamiento `x-ui.order` | Layout automático |
| **Filtrado de Props** | Eliminar props de contenedor | Props limpias |
| **Lógica de Layout** | Layout responsivo | UI adaptativa |
| **Gestión de Secciones** | Agrupar elementos relacionados | Organización visual |

### 🧭 Menu Renderers - Navegación:

| **Renderer** | **Función** | **Características** |
| ------------ | ---------- | ------------ |
| **menu-item** | Elementos de menú individuales | Manejo de enlaces, estados activos |
| **menu-container** | Organización de menú | Jerarquía, ordenamiento, responsivo |

### 📄 Content Renderer - Visualización:

| **Función** | **Uso** | **Características** |
| ---------- | ------- | ------------------- |
| **Contenido Estático** | Texto, imágenes, etc. | Sin integración de formulario |
| **Procesamiento Mínimo** | Renderizado directo | Rendimiento optimizado |


## ⚙️ Cómo Funciona el Sistema

**Flujo conceptual de cómo los renderers procesan componentes:**

### 🔄 Pipeline de Resolución:

```
Schema JSON
    ↓
Detectar Tipo (¿Qué renderer usar?)
    ↓
Obtener Renderer (En jerarquía de prioridad)
    ↓
Preparar Props (Fusionar + contexto)
    ↓
Aplicar Middleware (Transformar + validar)
    ↓
Renderizar (Componente + wrapper)
    ↓
Elemento React/Vue Final
```

### 🎯 Jerarquía de Resolución:

**Cómo el sistema elige qué renderer usar:**

| **Prioridad** | **Fuente** | **Cuándo Usar** | **Ejemplo** |
| -------------- | --------- | --------------- | ----------- |
| **1ra - Local** | Props de factory | Personalización específica | `<FormFactory renderers=\{\{field: CustomField\}\} />` |
| **2da - Global** | scheptaProvider | Predeterminado de aplicación | `<scheptaProvider renderers=\{\{field: AppField\}\} />` |
| **3ra - Registro** | registerRenderer() | Extensiones globales | `registerRenderer('field', LibField)` |
| **4ta - Predeterminado** | Sistema integrado | Comportamiento predeterminado | FieldRenderer interno |

### ⚡ Orquestador Central:

**El "director" que coordina todo el proceso:**

**Responsabilidades:**
- **Detecta** qué tipo de componente renderizar
- **Elige** el renderer apropiado de la jerarquía  
- **Prepara** props fusionando contextos
- **Aplica** pipeline de middleware específico del tipo
- **Renderiza** el componente final con su wrapper


## 🤝 Por Qué Existen los Renderers

**Los problemas que el sistema de renderers resuelve:**

### 🎯 Separación de Responsabilidades:

**Sin renderers**, cada componente necesita:
- Mezclar lógica de UI con lógica de negocio
- Gestionar contexto manual e inconsistentemente  
- Implementar validación específica del tipo en cada campo
- Transformar props de manera ad-hoc y no estandarizada

**Con renderers**, los componentes se vuelven:
- **Más limpios:** enfoque exclusivo en presentación visual
- **Más consistentes:** inyección de contexto automática y estandarizada
- **Más reutilizables:** validación y lógica encapsuladas en el renderer
- **Más predecibles:** transformación de props sigue patrones establecidos

### 🔄 Flexibilidad del Sistema:

**El mismo componente puede tener diferentes comportamientos:**
- **Campo de Formulario:** FieldRenderer añade validación + integración de formulario
- **Visualización Solo Lectura:** ContentRenderer mantiene visualización simple, sin lógica de formulario  
- **Elemento de Menú:** ItemRenderer añade navegación + estado activo
- **App Personalizada:** CustomRenderer implementa comportamiento específico de la aplicación

**Esto permite:** apps multi-tenant, A/B testing, integración con diferentes librerías de UI, y extensiones personalizadas sin modificar componentes base.


## 💡 Conceptos Relacionados

**Los Renderers son el "motor" que conecta otros conceptos:**

- **[01. Factories](./01-factories.md):** Las factories usan renderers para procesar cada componente
- **[04. Schema Resolution](./04-schema-resolution.md):** Pipeline de resolución detecta qué renderer usar  
- **[06. Middleware](./06-middleware.md):** Cada renderer tiene un pipeline específico
- **[03. Provider](./03-provider.md):** Configura renderers globalmente
- **[07. Debug System](./07-debug-system.md):** Herramientas de debug muestran qué renderer fue elegido

