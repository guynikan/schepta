# Guia rápido do demo

Na raiz do repositório, execute:

```bash
pnpm demo:dev
```

Abra <http://127.0.0.1:4173>. O app importa e renderiza `src/ui/onboarding.ui.json` usando React/MUI; não há caixa de prompt, geração offline, servidor de modelos ou chaves.

Para testar um prompt real, inicie um worker Codex no diretório do fixture com a Skill `skills/schepta-ui/SKILL.md`. O worker consulta `schepta-ui-spec catalog`, escreve somente UiSpec e usa os erros de `validate` para no máximo duas correções.
