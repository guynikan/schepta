# Schepta no mundo das IAs

Grandes players na corrida de IA e de plataformas já adotam a ideia de “UI a partir de JSON” ou protocolos declarativos. O Schepta não está inventando o conceito; está implementando uma engine framework-agnostic no mesmo espaço. Neste artigo: como essa tendência valida o caminho, como o Schepta responde ao problema do não-determinismo das IAs e como ele se encaixa em fluxos que vão do código assistido ao 100% automatizado com agents.

---

## Validação: json-render e o ecossistema

A ideia de usar schema ou JSON como fonte da verdade para a interface já é levada a sério por quem constrói ferramentas de desenvolvimento. Projetos como o **json-render** (Vercel) focam em renderizar UI a partir de JSON no ecossistema React. O **A2UI** (Google) é um projeto aberto para interfaces dirigidas por agentes: um único spec em JSON pode ser renderizado em várias plataformas (web, Flutter, etc.). Isso reforça que o caminho do Schepta — especificação declarativa, múltiplos runtimes — está alinhado com a direção do mercado.

O Schepta implementa uma engine com foco em forms e extensibilidade (middlewares, registry), no mesmo espaço conceitual em que esses projetos atuam. A citação aqui é de validação: o caminho é válido.

---

## Schepta como resposta ao não-determinismo das IAs

IAs são não determinísticas. A mesma pergunta pode gerar saídas diferentes; código ou UI gerados diretamente por LLMs variam em formato, estilo e até correção. Colocar isso direto na tela ou no código da aplicação gera imprevisibilidade e risco.

O Schepta introduz uma **camada de contrato**. Em vez de a IA gerar componentes ou markup solto, ela gera — ou o desenvolvedor edita — um **schema JSON**. Esse schema é validado (estrutura, tipos, regras) e só então é transformado em UI pelo motor do Schepta. Ou seja: **dado um schema válido, a UI é determinística**. A não-determinismo fica contida na produção ou edição do schema; a renderização é sempre previsível e testável.

Em fluxos com IA — copilot, agents, backends que montam UI dinamicamente — você precisa de um ponto de estabilidade. O schema é esse ponto: pode ser gerado por IA, por humano ou por um agent; uma vez válido, o Schepta garante o mesmo resultado. Testes E2E podem rodar sobre schemas fixos; regressões vêm de mudanças no schema, não de variação aleatória do render.

Em resumo: o Schepta é a camada que torna a UI previsível mesmo quando a fonte (IA, agent, backend) não é.

---

## Fluxos de trabalho com IA: do código assistido ao 100% automatizado

O Schepta se posiciona em um contínuo de fluxos com IA.

**Código assistido (human-in-the-loop):** o desenvolvedor usa IA para sugerir ou gerar schemas (por exemplo: “gera um form de cadastro com email, nome, aceite de termos”); revisa e ajusta o JSON; o Schepta renderiza. A IA acelera a produção do schema; o humano valida; a engine garante UI consistente.

**Híbrido (IA gera, humano aprova):** o backend ou uma ferramenta alimentada por IA produz o schema (formulário por tenant, wizard por contexto); um passo de aprovação ou validação — humano ou por regras — pode existir antes de enviar ao front; o Schepta recebe o schema e renderiza. Ainda há controle; a renderização continua determinística.

**100% automatizado (agents):** um agent toma decisões e produz o schema (por exemplo um assistente que monta a tela conforme a conversa); o schema é enviado ao cliente; o Schepta renderiza sem intervenção humana. O contrato (schema) segue válido e versionável; a única não-determinismo está na geração do schema pelo agent; uma vez entregue, a UI é previsível e auditável.

Em todos os níveis, o Schepta oferece: (1) **interface estável** — sempre schema in, UI out; (2) **validação na entrada** — schema inválido não vira tela quebrada; (3) **mesma engine** para assistido e automatizado, permitindo evoluir o fluxo sem trocar de stack; (4) **testabilidade** — cenários com schemas fixos cobrem o comportamento do render independentemente de quem gerou o schema.

Do código assistido ao 100% automatizado com agents, o Schepta é a camada que transforma qualquer schema válido em UI determinística — seja o schema escrito à mão, sugerido por um copilot ou gerado por um agent. Já existe um exemplo concreto desse fluxo: o **MCP do Schepta no Claude**, com demonstração em vídeo e documentação.

---

## Demo: Schepta via MCP no Claude

O **MCP (Model Context Protocol)** permite que assistentes como o Claude usem ferramentas externas. Existe um MCP para o Schepta que expõe três ferramentas no Claude: obter o JSON Schema dos formulários, validar uma instância de formulário contra esse schema e abrir um *preview* do formulário diretamente no chat. Assim, você pode pedir ao Claude que crie ou edite um formulário Schepta em linguagem natural; o Claude chama as ferramentas (schema → validação → preview) e o formulário é renderizado na conversa.

Um exemplo de prompt que você pode usar para reproduzir a demonstração:

> Crie um formulário de cadastro de funcionário usando o MCP do Schepta. O formulário deve ter as seções e campos abaixo:
>
> **Seção "Dados Pessoais"**
> - Nome completo (InputText)
> - E-mail corporativo (InputText)
> - Telefone (InputPhone)
>
> **Seção "Cargo e Departamento"**
> - Cargo (InputText)
> - Departamento (InputSelect)
> - Data de início (InputDate)

Você pode ver uma demonstração em vídeo no Claude, com o assistente chamando as tools e renderizando o form no chat: [assistir no YouTube](https://youtu.be/ZlIYS-DzQUQ). Configuração e descrição das ferramentas: [Schepta MCP na documentação](/pt-BR/guide/schepta-mcp).

---

## Próximo passo

No próximo artigo da série falamos de [**onde e como usar o Schepta**](04-onde-e-como-usar-o-schepta.md): planos futuros (outras factories além de forms), outros usos (multi-tenant, testes A/B, wizards, white-label) e por que a suite de testes garante que você pode focar só na parte de negócio.

Documentação, exemplos e **Schepta MCP**: [schepta.org](https://schepta.org).
