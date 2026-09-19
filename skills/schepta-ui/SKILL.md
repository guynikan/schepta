# Skill Schepta UiSpec

Use esta Skill quando o usuário pedir uma interface, página ou onboarding no fixture Schepta.

1. Execute `pnpm --filter @schepta/core build` e `node ../../packages/core/dist/ui-spec.mjs catalog` a partir de `examples/generative-ui` para consultar o vocabulário permitido antes de gerar qualquer coisa.
2. Gere somente o conteúdo declarativo JSON de `src/ui/onboarding.ui.json`. Nunca gere React, MUI, HTML, CSS, `FormSchema` ou chamadas de provider.
3. Execute `node ../../packages/core/dist/ui-spec.mjs validate src/ui/onboarding.ui.json`. Se for aceito, execute `normalize` e substitua o artefato pelo JSON normalizado.
4. Se houver erros estruturados, use-os para orientar uma nova geração. Há no máximo duas novas tentativas após a inicial; nunca fabrique um fallback, uma UiSpec inválida ou um erro artificial.
5. Só apresente ou renderize uma UiSpec aceita. Componentes, props, bindings, ações e estado fora do catálogo devem ser removidos ou convertidos para o vocabulário consultado.

O runtime mantém framework e biblioteca UI fora do contexto do agente. `FormSchema` pertence ao fluxo de formulários original e não deve ser aninhado em UiSpec.
