# Code Review por IA

Guia para usar um agente como **revisor** de um PR neste repositório. O agente revisa contra os padrões do projeto — ele não aprova no lugar do humano. A aprovação final continua sendo do squad/Tech Lead (ver [CONTRIBUTING.md](../../CONTRIBUTING.md)).

## Leia antes de iniciar a review

Sem esse contexto a review vira opinião genérica. O agente deve abrir, nesta ordem:

1. **[AGENTS.md](../../AGENTS.md)** — mapa de regras e o que exige aprovação humana.
2. **[ai-context.md](ai-context.md)** — stack, camadas, tokens e padrão de página.
3. **[definition-of-done.md](definition-of-done.md)** — os portões que o PR precisa cruzar.
4. **AGENTS.md do domínio tocado** (`packages/[domínio]/AGENTS.md`), se o PR mexe num domínio.
5. **A issue do PR** — revise contra o "Pronto quando" dela, não contra gosto pessoal.
6. **Convenção/ADR da área** quando relevante: [tokens](../conventions/tokens-e-theming.md), [code-style](../conventions/code-style.md), [acessibilidade](../conventions/acessibilidade.md), [criação de componentes](../conventions/creating-components.md), [ADR-0004 camadas](../adr/ADR-0004-arquitetura-em-camadas.md).

## Pontos importantes a verificar

Prioridade alta — bloqueiam o merge:

- **Fronteiras de camada.** Import só de cima para baixo. Domínio importando outro domínio (`@portal/checklist` ↔ `@portal/comunicados` ↔ `@portal/mapa-salas`) é proibido. Lógica cross-domain deve ir para `@portal/core` ou `@portal/shared`.
- **Tokens.** Sem hex cru, tamanho arbitrário (`text-[14px]`, `w-[280px]`, `bg-[#hex]`) ou valor fora da escala. Exceção só com comentário justificando e aprovação.
- **`'use client'` indevido.** Server Component é o padrão; só marque client quando há `useState`/`useEffect`/`useRef` ou event handler.
- **Definition of Done.** `lint`, `typecheck` e `build` precisam passar. Componente novo de UI sem story, ou lógica nova em `core`/`shared`/scripts sem teste, é apontamento.

Exige aprovação humana — **sinalize, nunca aprove sozinho:**

- Mudança em `packages/ui/` (design system).
- Nova dependência externa (`pnpm add`).
- Qualquer exceção às fronteiras de camada ou de token.

Higiene:

- Commits em Conventional Commits referenciando a issue; PR dentro do GitFlow (nasce e morre em `develop`).
- Escopo do PR bate com a issue — sem mudança não relacionada "de carona".

## Como reportar

- Aponte cada achado por `arquivo:linha`, com **severidade** (bloqueante / sugestão).
- Para token/camada, proponha a correção concreta (o token semântico certo, ou para onde mover a lógica).
- Seja específico e enxuto: o objetivo é tirar a revisão mecânica do humano, não gerar ruído.

→ Para o fluxo inverso (IA implementando, não revisando), ver [como-usar-ia.md](como-usar-ia.md).
