# Onde e como usar o Schepta

Este artigo é para quem vai adotar o Schepta: planos futuros da arquitetura (outras factories além de forms), cenários de uso — multi-tenant, testes A/B, wizards, white-label — e por que a suite de testes garante que sua aplicação pode focar na parte de negócio. No final, um resumo prático de onde o projeto vive e da extensibilidade.

---

## Planos futuros e arquitetura: outras factories, prioridade em forms

O core do Schepta (orquestrador, registry, middlewares, pipeline schema → render) é agnóstico do *tipo* de UI. O mesmo mecanismo que hoje alimenta o **FormFactory** pode alimentar outras factories — por exemplo **MenuFactory** (navegação dinâmica a partir de schema), dashboards, wizards. A arquitetura já prevê isso (tipos de componente como `menu-item`, `menu-container` na documentação de conceitos).

No momento foi priorizado forms porque **grande parte da complexidade em aplicações multi-tenant está nos formulários**: campos por tenant, validações por contexto, fluxos diferentes por cliente. Resolver bem “schema → form” desbloqueia o cenário mais doloroso; outras factories podem vir em seguida.

A arquitetura **permite a criação de outras factories além de forms**. A escolha de lançar com foco em forms é priorização (multi-tenant + complexidade), não limitação do desenho.

---

## Outros usos além de multi-tenant

**Multi-tenant** já está no centro: um schema por tenant, UI consistente.

**Testes A/B:** o mesmo fluxo ou tela pode ser servido com schemas diferentes — por exemplo variação A com 3 campos, variação B com 5 campos ou ordem diferente. O backend ou a camada de feature flags entrega o schema da variação; o Schepta renderiza. Sem trocar código do app, só o JSON.

**Wizards e fluxos dinâmicos:** próximos passos ou telas dependentes de contexto (respostas do usuário, perfil, permissões) podem ser modelados como schemas diferentes por etapa; o Schepta renderiza cada etapa.

**White-label / configuração por cliente:** além de multi-tenant “duro”, cenários em que cada cliente tem sua própria definição de formulários (CRM, ferramentas internas); o schema vem de configuração ou API e o Schepta mantém a UI consistente.

**Prototipagem e ferramentas low-code:** ferramentas que geram ou editam schemas (por humano ou por IA) e usam o Schepta como runtime de preview ou produção.

**Uso com IA e produtos no chat:** um produto que roda diretamente dentro do chat (por exemplo via MCP — Model Context Protocol) mantém a consistência entre os componentes: o cliente cria o próprio MCP e disponibiliza nas tools o schema de acordo com o usuário e com o que ele está pedindo; o Schepta renderiza o formulário ou a UI no próprio chat. Assim, assistentes como o Claude podem invocar as tools (obter schema, validar, abrir preview) e a interface exibida é sempre a mesma engine Schepta, previsível e testável.

Schema-driven UI serve para vários problemas, não só “um form por tenant”.

| Cenário        | Como o Schepta ajuda |
|----------------|------------------------|
| Multi-tenant   | Um schema por tenant; mesma engine, UI consistente. |
| Testes A/B     | Schemas diferentes por variação; sem alterar código. |
| Wizards        | Um schema por etapa; renderização por contexto. |
| White-label    | Schema por cliente via config ou API. |
| Low-code / IA  | Runtime estável para schemas gerados ou editados. |
| IA / produto no chat | Cliente expõe schema nas tools do MCP; Schepta renderiza no chat com a mesma engine. |

---

## Testes como garantia: o app foca no negócio

O Schepta é coberto por **103 testes unitários** e **26 testes E2E** (Playwright) que validam o fluxo completo: schema → resolução → render → interação em React, Vue e Vanilla, incluindo integrações com react-hook-form e Formik. Isso **garante que a engine se comporta corretamente** — resolução de componentes, middlewares, validação, binding de campos.

Ao adotar o Schepta, o time do app **não precisa se preocupar** com “será que o schema vira componente certo?”, “será que o middleware roda na ordem?”, “será que o form adapter conecta?”. Esses detalhes estão cobertos pela suite; regressões da engine são detectadas antes de chegar ao app.

Nos aplicativos que usam o Schepta, o time pode concentrar esforço na **parte voltada para negócio**: validações específicas do domínio, regras de negócio em middlewares, definições de forms por contexto ou tenant, integração com APIs e fluxos. A “infraestrutura” de schema→UI está testada e estável.

Os testes são a **garantia de que as funcionalidades da engine funcionam**, abstraindo esses detalhes para que, nos apps onde o Schepta será usado, as preocupações sejam **apenas a parte voltada para negócio** (validações específicas, definições específicas de forms, etc.).

---

## Em resumo

- **Onde vive:** monorepo com `@schepta/core`, adapters (react, vue, vanilla), factories por framework; documentação e exemplos em [schepta.org](https://schepta.org).
- **Testes:** 103 testes unitários e 26 testes E2E (React, Vue, Vanilla), incluindo react-hook-form e Formik — garantia da engine; o app foca em lógica de negócio.
- **Extensibilidade:** middlewares para transformar props; registry para trocar componentes; renderers por tipo (field, container, button, content); expressões em props com `$formValues` e `$externalContext`.

Showcases por framework (React, Vue, Vanilla, MUI, Chakra, Vuetify, etc.) estão disponíveis na documentação.

---

## Próximo passo

No último artigo da série entramos em [**como o Schepta funciona por dentro**](05-como-o-schepta-funciona-por-dentro.md): factories, orquestradores, component registry e o pipeline de resolução até o render. Para quem quer profundidade técnica.

Enquanto isso: [schepta.org](https://schepta.org) para docs e exemplos.
