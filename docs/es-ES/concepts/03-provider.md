# Contexto Global

**Sistema que gestiona configuración y estado compartido** — el "centro de comando" que coordina todo schepta.

<img src="/images/03-provider.svg" alt="Provider" />


**El patrón Provider centraliza configuraciones que todos los componentes necesitan compartir:**

### 🔧 Qué Hace:

| **Configuración** | **Alcance** | **Beneficio** | **Ejemplo** |
| ---------------- | ---------- | ------------- | ----------- |
| **Component Registry** | Global | Componentes estandarizados | MUI como predeterminado |
| **Middleware Stack** | Global | Comportamiento consistente | Validación uniforme |
| **Theme Configuration** | Global | Identidad visual | Colores y fuentes |
| **Context Providers** | Global | Estado compartido | Usuario, permisos, locale |

### 📊 Jerarquía de Configuración:

**Jerarquía de Provider:**
```text
scheptaProvider (Nivel de App)
    ├── Global Component Registry
    ├── Global Middleware  
    ├── Theme Provider
    └── Context Providers
        └── FormFactory/MenuFactory (Local)
            ├── Local Component Overrides
            └── Local Middleware Overrides
```

**Ejemplo Rápido:**
```jsx
<scheptaProvider
  components={{ InputText: MUITextField, Button: MUIButton }}
  middleware={{ withValidation, withAnalytics }}
  theme={{ primary: '#007ACC' }}
>
  <App />
</scheptaProvider>
```

> **💡 Resultado:** Configurar una vez → Disponible en toda la aplicación. 


## 🚀 Tipos de Provider

**Cada provider gestiona un aspecto específico del sistema:**

### 🎨 scheptaProvider - Provider Maestro:

| **Configuración** | **Propósito** | **Predeterminado** | **Nivel de Override** |
| ----------------- | ----------- | ----------- | ------------------ |
| `components` | Registro global de componentes | Componentes integrados | Props de factory local |
| `middleware` | Pila global de middleware | Middleware básico | Props de factory local |
| `theme` | Configuración de tema visual | Tema predeterminado | CSS/styled-components |
| `debug` | Configuración del panel de debug | Auto (modo dev) | Variables de entorno |
| `cache` | Estrategia de caché | Predeterminados de React Query | Props del Provider |

### 🎛️ Component Registry Provider:

| **Tipo de Registro** | **Alcance** | **Prioridad** | **Caso de Uso** |
| --------------------- | --------- | ------------ | ------------ |
| **Default Registry** | Todo el sistema | Más baja | Componentes integrados |
| **Global Registry** | Toda la aplicación | Media | Librería de UI consistente |
| **Local Registry** | Específico de factory | Más alta | Overrides de componentes |
| **Dynamic Registry** | Runtime | Variable | A/B testing, temas |

### 🔧 Middleware Provider:

| **Tipo de Middleware** | **Alcance** | **Ejecución** | **Propósito** |
| ------------------- | --------- | ------------- | ----------- |
| **Core Middleware** | Sistema | Siempre ejecutado | Funcionalidad esencial |
| **Global Middleware** | Aplicación | Configurable | Comportamiento consistente |
| **Local Middleware** | Factory | Override/extend | Funcionalidad específica |
| **Conditional Middleware** | Basado en contexto | Condicional | Específico de rol/tenant |

### 🎨 Theme Provider:

| **Aspecto del Tema** | **Configuración** | **Herencia** | **Override** |
| ---------------- | ----------------- | --------------- | ------------ |
| **Colores** | Primario, secundario, etc. | Variables CSS | Props de componente |
| **Tipografía** | Fuentes, tamaños, pesos | Cascada CSS | Estilos inline |
| **Espaciado** | Márgenes, padding, grid | Clases CSS | Estilos de componente |
| **Componentes** | Estilos de componente predeterminados | Objeto de tema | Overrides de componente |


## ⚙️ Arquitectura del Provider

**Cómo funciona el sistema de providers:**

### 📋 Inicialización del Provider:

| **Fase** | **Proceso** | **Resultado** | **Dependencias** |
| --------- | ----------- | ---------- | ---------------- |
| **1. Provider Setup** | Inicializar contexto del provider | Contexto disponible | Ninguna |
| **2. Registry Registration** | Registrar componentes globales | Registro global poblado | Definiciones de componentes |
| **3. Middleware Registration** | Registrar middleware global | Pila de middleware lista | Funciones de middleware |
| **4. Theme Initialization** | Configurar contexto de tema | Tema disponible | Configuración de tema |
| **5. Context Propagation** | Propagar a componentes hijos | Providers activos | Contexto React/Vue |

### 🎯 Propagación de Contexto:

**Uso de Contexto React:**
```typescript
// Contextos de Provider
const scheptaContext = createContext<scheptaConfig>();
const ComponentRegistryContext = createContext<ComponentRegistry>();
const MiddlewareContext = createContext<MiddlewareStack>();
const ThemeContext = createContext<ThemeConfig>();

// Acceso mediante hooks
const useschepta = () => useContext(scheptaContext);
const useComponentRegistry = () => useContext(ComponentRegistryContext);
const useMiddleware = () => useContext(MiddlewareContext);
const usescheptaTheme = () => useContext(ThemeContext);
```

**Herencia de Configuración:**
```typescript
const mergedConfig = {
  // Configuración predeterminada
  ...defaultscheptaConfig,
  
  // Configuración del Provider  
  ...providerConfig,
  
  // Overrides de runtime
  ...runtimeConfig
};
```


## 📊 Patrones de Configuración

**Patrones comunes de configuración de provider:**

### 🎯 Patrones a Nivel de Aplicación:

| **Patrón** | **Caso de Uso** | **Configuración** | **Beneficios** |
| ----------- | ------------ | ----------------- | ----------- |
| **Single Theme** | App consistente | Una configuración de tema | Consistencia visual |
| **Multi-Theme** | App white-label | Tema por tenant | Flexibilidad de marca |
| **Component Library** | Sistema de diseño | Componentes consistentes | Velocidad de desarrollo |
| **Micro-frontends** | App distribuida | Configuraciones con alcance | Independencia de equipos |

### 🔧 Integración con Librería de Componentes:

**Integración Material-UI:**
```typescript
<scheptaProvider
  components={{
    InputText: MuiTextField,
    Button: MuiButton,
    Select: MuiSelect,
    Checkbox: MuiCheckbox
  }}
  theme={{
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
  }}
>
  <App />
</scheptaProvider>
```

**Integración Ant Design:**
```typescript
<scheptaProvider
  components={{
    InputText: AntInput,
    Button: AntButton,
    Select: AntSelect,
    Checkbox: AntCheckbox
  }}
  theme={{
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a'
    }
  }}
>
  <App />
</scheptaProvider>
```

### 🎨 Configuración Multi-Tenant:

**Providers Específicos por Tenant:**
```typescript
const TenantProvider = ({ tenant, children }) => {
  const tenantConfig = getTenantConfig(tenant);
  
  return (
    <scheptaProvider
      components={tenantConfig.components}
      theme={tenantConfig.theme}
      middleware={tenantConfig.middleware}
    >
      {children}
    </scheptaProvider>
  );
};
```


## 💡 Conceptos Relacionados

**El patrón Provider gestiona la configuración para todos los demás conceptos:**

- **[01. Factories](./01-factories.md):** Las factories usan configuración del Provider
- **[04. Schema Resolution](./04-schema-resolution.md):** La resolución usa contexto del Provider  
- **[05. Renderer](./05-renderer.md):** Renderers resueltos vía registro del Provider
- **[06. Middleware](./06-middleware.md):** Middleware registrado en el Provider
- **[07. Debug System](./07-debug-system.md):** Debug configurado vía Provider

