# Schepta MCP

## What it is

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZlIYS-DzQUQ" title="Schepta MCP in Claude" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Schepta MCP** is an MCP App (Ext Apps) that exposes Schepta form tools in Claude:

- **get_form_schema** — returns the JSON Schema for Schepta forms so you can build valid instances.
- **validate_schema** — validates a form instance against the schema; returns `{ valid, errors }`.
- **preview_form** — opens the widget in chat and renders the form from a validated instance.

In Claude you can ask it to create or validate Schepta forms and see the preview in the chat.

## How to use in Claude

1. In **Claude** (web or desktop), open **Settings** → **Connectors** → **Add custom connector**.
2. Paste the **connector URL** (MCP server base), for example:
   - `https://mcp.schepta.org` (if you use that domain), or
   - your deploy URL (e.g. `https://schepta-mcp.onrender.com`).
3. The MCP client uses the `/mcp` endpoint on that base; you usually don’t need to add `/mcp` to the URL.
4. Reference: [Getting started with custom connectors (Anthropic)](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

**Note:** Custom connectors are available on Claude Pro, Max, or Team plans.

## Tools

| Tool               | Description |
|--------------------|-------------|
| **get_form_schema** | Returns the JSON Schema for Schepta forms. Use it to learn the structure before building an instance. |
| **validate_schema** | Validates an instance against the schema. Returns `valid` and a list of `errors`. If valid, you can use **preview_form**. |
| **preview_form**    | Opens the widget in chat and renders the form from a validated instance. |
