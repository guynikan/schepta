# Schepta MCP

## Qué es

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZlIYS-DzQUQ" title="Schepta MCP en Claude" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

El **Schepta MCP** es un MCP App (Ext Apps) que expone herramientas de formulario Schepta en Claude:

- **get_form_schema** — devuelve el JSON Schema de los formularios Schepta para construir instancias válidas.
- **validate_schema** — valida una instancia de formulario contra el schema; devuelve `{ valid, errors }`.
- **preview_form** — abre el widget en el chat y renderiza el formulario a partir de una instancia validada.

Así, en Claude puedes pedir que cree o valide formularios Schepta y ver el preview en el chat.

## Cómo usar en Claude

1. En **Claude** (web o escritorio), abre **Settings** → **Connectors** → **Add custom connector**.
2. Pega la **URL del connector** (base del servidor MCP), por ejemplo:
   - `https://mcp.schepta.org` (si configuraste el dominio), o
   - la URL de tu deploy (ej.: `https://schepta-mcp.onrender.com`).
3. El cliente MCP usa el endpoint `/mcp` en esa base; no suele hacer falta añadir `/mcp` a la URL en muchos clientes.
4. Referencia: [Getting started with custom connectors (Anthropic)](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

**Nota:** Los custom connectors están disponibles en planes Claude Pro, Max o Team.

## Herramientas

| Herramienta          | Descripción |
|----------------------|-------------|
| **get_form_schema** | Devuelve el JSON Schema de los formularios Schepta. Úsalo para conocer la estructura antes de construir una instancia. |
| **validate_schema** | Valida una instancia contra el schema. Devuelve `valid` y lista de `errors`. Si es válida, puedes usar **preview_form**. |
| **preview_form**    | Abre el widget en el chat y renderiza el formulario a partir de una instancia validada. |

