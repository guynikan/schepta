# Schepta MCP

## O que é

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZlIYS-DzQUQ" title="Schepta MCP no Claude" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

O **Schepta MCP** é um MCP App (Ext Apps) que expõe ferramentas de formulário Schepta no Claude:

- **get_form_schema** — retorna o JSON Schema dos formulários Schepta para construir instâncias válidas.
- **validate_schema** — valida uma instância de formulário contra o schema; retorna `{ valid, errors }`.
- **preview_form** — abre o widget no chat e renderiza o formulário a partir de uma instância validada.

Assim, no Claude você pode pedir que crie ou valide formulários Schepta e ver o preview no chat.

## Como usar no Claude

1. Em **Claude** (web ou desktop), abre **Settings** → **Connectors** → **Add custom connector**.
2. Cole a **URL do connector** (base do servidor MCP), por exemplo:
   - `https://mcp.schepta.org` (se você configurou o domínio), ou
   - a URL do seu deploy (ex.: `https://schepta-mcp.onrender.com`).
3. O cliente MCP usa o endpoint `/mcp` nessa base; não precisa acrescentar `/mcp` à URL em muitos clientes.
4. Referência: [Getting started with custom connectors (Anthropic)](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

**Nota:** Custom connectors estão disponíveis em planos Claude Pro, Max ou Team.

## Ferramentas

| Ferramenta          | Descrição |
|---------------------|-----------|
| **get_form_schema** | Retorna o JSON Schema dos formulários Schepta. Use para saber a estrutura antes de construir uma instância. |
| **validate_schema** | Valida uma instância contra o schema. Retorna `valid` e lista de `errors`. Se válida, você pode usar **preview_form**. |
| **preview_form**    | Abre o widget no chat e renderiza o formulário a partir de uma instância validada. |
