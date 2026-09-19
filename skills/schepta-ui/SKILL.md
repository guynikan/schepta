# Skill Schepta UiSpec

Use esta Skill quando o usuário pedir uma interface, página ou onboarding no fixture Schepta.

1. Execute `pnpm --filter @schepta/core build` a partir de `examples/generative-ui`.
2. Execute `node ../../packages/core/dist/ui-spec.mjs catalog` e, em seguida, `node ../../packages/core/dist/ui-spec.mjs schema`, antes de gerar qualquer JSON. Use o catálogo e o schema nessa ordem como o contrato permitido.
3. Gere somente o conteúdo declarativo JSON de `src/ui/onboarding.ui.json`. Nunca gere React, MUI, HTML, CSS, `FormSchema` ou chamadas de provider.
4. Execute `node ../../packages/core/dist/ui-spec.mjs validate src/ui/onboarding.ui.json`. Se for aceito, execute `normalize` e substitua o artefato pelo JSON normalizado.
5. Se houver erros estruturados, use-os para orientar uma nova geração. Há no máximo duas novas tentativas após a inicial; nunca fabrique um fallback, uma UiSpec inválida ou um erro artificial.
6. Só apresente ou renderize uma UiSpec aceita. Componentes, props, bindings, ações e estado fora do catálogo devem ser removidos ou convertidos para o vocabulário consultado.

O runtime mantém framework e biblioteca UI fora do contexto do agente. `FormSchema` pertence ao fluxo de formulários original e não deve ser aninhado em UiSpec.
