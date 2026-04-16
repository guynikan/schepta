# Por que não fui pelo caminho comum

O momento atual no desenvolvimento de software empurra muitos devs para dois caminhos: microsaas (ou produto fechado) para monetizar rápido, ou apostar em agentes de IA e automação com agentes — produtos e ferramentas em que o agente “resolve” tarefas sozinho. Este artigo é sobre por que não fui por aí. Uma análise do cenário, uma escolha consciente e uma provocação: o caminho comum é legítimo, mas não é o único.

---

## O que está em jogo

Há pressão por receita, por impacto visível e por estar na onda. Microsaas virou atalho para muitos indies: produto enxuto, assinatura, crescimento. Do outro lado, agentes de IA e workflows agentic ganharam tração — a ideia de que a IA não é só assistente, mas workforce autônoma que lê código, implementa features, abre PRs. Em 2025–2026 isso deixou de ser só experimento e virou opção concreta de produto e de posicionamento.

Nada disso é errado. São escolhas. O que quero deixar claro é: **por que, no caso do Schepta, escolhi outro caminho.**

---

## Por que não microsaas — e por que lib open source é a resposta

Ser uma **lib open source** é, no meu caso, a resposta direta a “por que não microsaas”.

O objetivo é resolver bem um problema técnico: fazer com que a definição da interface (schema) vire UI real em vários frameworks, de forma estável e adotável. Uma lib aberta permite que times adotem sem fricção — instalam, integram — antes de qualquer contrato, preço ou vendor lock-in. Microsaas traz tudo isso antes de o valor estar provado; o escopo que escolhi é a lib.

Ser open source não é só uma questão de estágio do projeto: foi escolha para que a comunidade possa contribuir e estender o uso. Infraestrutura para construir interface a partir de schema ainda é escassa; uma biblioteca aberta é um bem que outros podem usar, auditar e estender. O Schepta tem 103 testes unitários e 26 testes E2E (Playwright), além de documentação que servem de garantia e de referência. Em 2026, a tendência é que a base desse tipo de ferramenta seja aberta; o Schepta se posiciona aí.

---

## Por que não estou automatizando (ainda) a resolução de tasks com agents

O Schepta é a fundação em que “o que renderizar” (o schema) está separado de “como renderizar” (os componentes e a engine). Agentes de IA que geram ou alteram interface precisam dessa fundação estável. Automatizar a resolução de tarefas — agentes que resolvem tarefas sozinhos — sem essa base é frágil.

A prioridade é ter a engine estável e previsível. O schema que o Schepta consome é um contrato claro e auditável entre backend, agente e frontend; automatizar a resolução de tarefas em cima disso é um passo seguinte, não o primeiro. Não é rejeição aos agentes de IA — é **ordem**: primeiro a base, depois o agente. O desenho do Schepta facilita que agentes gerem ou alterem o schema no futuro; hoje o foco é que essa base funcione bem.

Construir a base técnica aberta e reutilizável, na ordem que faz sentido para o projeto, em vez de microsaas rápido ou agentes primeiro: foi essa a escolha. Se foi a correta ou não, somente o tempo dirá.


Se essa discussão de caminhos fez sentido, a documentação e os exemplos do Schepta estão em [schepta.org](https://schepta.org).

E você: está no caminho do microsaas, dos agentes ou construindo base aberta primeiro? O que pesou na sua escolha?

---

## Próximo passo

No próximo artigo da série falamos de [**Schepta no mundo das IAs**](03-schepta-no-mundo-das-ias.md): como o ecossistema (json-render, A2UI) valida essa abordagem, como o Schepta responde ao problema do não-determinismo das IAs e como ele se encaixa em fluxos que vão do código assistido ao 100% automatizado com agents.
