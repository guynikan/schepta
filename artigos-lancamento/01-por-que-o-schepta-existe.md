# Por que o Schepta existe

Este artigo explica o que é o Schepta, que problema ele resolve (em linguagem não técnica) e que espaço ele preenche. Por que escolhi uma lib open source em vez de microsaas e por que não apostei (ainda) em agentes de IA que resolvem tarefas sozinhos é o tema do **próximo artigo** da série.

---

## O que é e quais problemas resolve

O **Schepta** é uma ferramenta que transforma uma descrição da interface — em formato JSON — em telas e formulários reais, sem precisar escrever cada tela à mão em código. Essa descrição pode ser interpretada em React, Vue ou JavaScript puro, conforme o projeto.

O **problema** que ele ajuda a resolver aparece quando a interface depende de muitos contextos: vários clientes (multi-tenant), vários fluxos, testes A/B, ou quando o backend e até ferramentas de IA definem o que deve aparecer na tela. Nesses casos, escrever e manter cada variação em código vira caos. O Schepta centraliza a "definição" da tela num único formato (o schema); uma única engine interpreta esse formato e gera a interface. Quem usa o Schepta pode focar nas regras de negócio e na definição do que mostrar em cada contexto, em vez dos detalhes de implementação de cada variação.

// TODO : citar tb o problema do não-determinismo das IAs

---

## Por que o Schepta existe — que espaço ele preenche

O Schepta existe para cenários em que você precisa que a **definição da interface** (o que mostrar, em que ordem, com que validações) seja tratada como dado — um schema que carrega semântica de UI, não só de validação de dados. Ele foi pensado para ser **agnóstico de framework**: o mesmo schema pode ser usado em React, Vue ou JavaScript puro. O núcleo é enxuto e extensível, com padrões sensatos que você pode trocar quando precisar. E o fluxo todo foi desenhado para **interface dirigida por servidor ou por contexto** — por exemplo um schema por cliente ou por tenant —, não só para formulários fixos definidos no momento do build.

Se esse espaço faz sentido para o seu projeto, o Schepta é uma opção. A escolha entre usar o Schepta ou outras ferramentas depende das necessidades de cada pessoa ou de cada time; o que importa é que esse espaço existe e que o Schepta está aí para preenchê-lo.

Se esse problema te soa familiar, a documentação e os exemplos (React, Vue e Vanilla) estão em [schepta.org](https://schepta.org).

E você: já passou por esse caos de forms que mudam por cliente, A/B ou backend? Como resolveu?

---

## Próximo passo

No próximo artigo da série conto [**por que não fui pelo caminho comum**](02-por-que-nao-fui-pelo-caminho-comum.md): uma análise do momento atual no desenvolvimento de software, o que muitos devs estão fazendo (microsaas, agentes de IA e automação com agentes) e por que escolhi uma lib open source, sem SaaS e sem apostar (ainda) em agentes que resolvem tarefas sozinhos.