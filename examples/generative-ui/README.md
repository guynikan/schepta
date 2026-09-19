# Schepta Generative UI harness

Este fixture React + TypeScript + MUI renderiza o artefato versionado `src/ui/onboarding.ui.json`. Ele não contém prompt no navegador, gerador offline, endpoint HTTP de geração, MCP, provider OpenAI ou dependência de chave de API.

## Run from the repository root

```bash
pnpm install
pnpm demo:dev
```

Abra <http://127.0.0.1:4173>. O caminho de prompt real é um worker Codex com a Skill `skills/schepta-ui/SKILL.md`: ele inspeciona o catálogo local antes de escrever o JSON e devolve erros estruturados para, no máximo, duas correções.

## Verification

```bash
pnpm demo:build
pnpm demo:type-check
pnpm demo:e2e
```

Os E2E originais são somente referência de comportamento; o SDK não os executa ao gerar a UiSpec.
