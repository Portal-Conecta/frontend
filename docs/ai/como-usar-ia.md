# Como usar IA neste repositório

Convenção curta para o squad. O objetivo é que a geração assistida siga os padrões do repo sem virar retrabalho na revisão.

## Chat vs. agente

| Modo | Quando usar | Exemplos |
|---|---|---|
| **Chat** (sem acesso ao repo) | Tirar dúvida, explorar abordagem, gerar trecho isolado que você cola e adapta. | "Como tipar esse reducer?", "Qual a diferença entre X e Y no App Router?" |
| **Agente** (lê e edita o repo) | Implementar uma tarefa de ponta a ponta, refatorar, criar arquivos seguindo os padrões do projeto. | "Implemente a página do domínio checklist", "Crie a story do Button". |

Regra prática: se a resposta precisa **conhecer as fronteiras e tokens do repo**, use agente e ancore-o nos guardrails. Se é conhecimento geral, chat resolve.

## Contexto para colar no chat

Mesmo no chat (sem acesso ao repo), cole o bloco abaixo **antes da sua pergunta** para a IA responder dentro das nossas regras, em vez de sugerir hex cru, import lateral ou `'use client'` à toa.

```text
Contexto do projeto (Portal Conecta Frontend). Responda respeitando estas regras:
- Stack: Next.js 15 (App Router), React 19, TypeScript estrito, Tailwind CSS v4, pnpm workspaces.
- Server Component é o padrão; só use 'use client' quando houver useState/useEffect/useRef ou event handler.
- Camadas, import só de cima para baixo: shared (utils puros) → ui (design system) → core (auth/layout/rbac/routing) → domínios (checklist, comunicados, mapa-salas) → apps/root (shell).
- Domínios NUNCA importam outros domínios; lógica cross-domain vai para core ou shared.
- Tokens: proibido hex cru, tamanho arbitrário (text-[14px], w-[280px], bg-[#hex]) ou valor fora da escala. Use classes semânticas (bg-interactive-default, text-text-inverse, mt-8) e <Text variant="...">.
- Antes de eu aplicar: lint, typecheck e build precisam passar; componente de UI novo precisa de story.

Minha pergunta:
```

> Para uma tarefa completa (não uma dúvida), prefira um agente com o [Context Pack](ai-context.md) — é mais completo que este resumo de chat.

## Ancorando o agente

Antes de pedir implementação, dê ao agente o contexto certo:

1. Cole o [Context Pack](ai-context.md) (ou aponte o agente para o `AGENTS.md`, que ele deve ler primeiro).
2. Trabalhando dentro de um domínio? Aponte também o `AGENTS.md` daquele pacote (`packages/[domínio]/AGENTS.md`).
3. Feche o pedido com a [Definition of Done](definition-of-done.md): o trabalho só está pronto com `lint`, `typecheck` e `build` passando.

## O que delegar (e o que não)

- **Delegue:** boilerplate de componente, story, types, services, página de domínio seguindo o padrão, testes de lógica, e **code review de PR** (rubric completo em [/REVISION.md](../../REVISION.md), fluxo de invocação em [code-review.md](code-review.md)).
- **Revise sempre, nunca aceite no automático:** mudanças em `packages/ui` (design system), uso de tokens, `pnpm add` de dependência nova, qualquer import entre camadas. Essas exigem aprovação humana — ver [AGENTS.md](../../AGENTS.md).
- **Não delegue decisão de arquitetura:** isso vira [ADR](../adr/README.md), discutida pelo squad.

## Higiene de trabalho

- Um agente por tarefa, em sua própria branch `feature/` (ver [CONTRIBUTING.md](../../CONTRIBUTING.md)). Worktrees isolam o working tree entre tarefas paralelas.
- O agente abre PR como qualquer dev: 1 aprovação mínima, CI verde, Conventional Commits referenciando a issue.
- Não commite credencial nem segredo gerado por IA.
