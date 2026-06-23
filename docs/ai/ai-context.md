# Context Pack para IA

Bloco de contexto **colável** em um agente de código antes de trabalhar neste repositório. Cole a partir da linha abaixo. Para o contexto completo, o agente deve abrir o [AGENTS.md](../../AGENTS.md).

---

Você vai trabalhar no **Portal Conecta Frontend**. Respeite estas regras:

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript estrito · Tailwind CSS v4 · pnpm workspaces. Server Component é o padrão — só use `'use client'` quando o arquivo usa `useState`/`useEffect`/`useRef` ou define event handler.

**Camadas (import só de cima para baixo):**

```
@portal/shared    ← tipos e utilitários puros, sem React
@portal/ui        ← design system: tokens, atoms, molecules, organisms
@portal/core      ← infraestrutura: auth, layout, roteamento, RBAC
@portal/[domínio] ← features: checklist · comunicados · mapa-salas
apps/root         ← shell Next.js: registra rotas, importa domínios
```

Domínios **nunca** importam outros domínios (o ESLint quebra o CI). Lógica cross-domain vai para `@portal/shared` (utilitário genérico) ou `@portal/core` (infraestrutura de negócio).

**Padrão de página de módulo:** o componente de página nasce em `packages/[domínio]/src/pages/PageX.tsx` e o shell o monta em `apps/root/src/app/[rota]/page.tsx`.

**Tokens:** se existe um token, use o token. Proibido hex cru (`bg-[#01258F]`), tamanho arbitrário (`text-[14px]`, `w-[280px]`) e valores fora da escala. Use classes semânticas (`bg-interactive-default`, `text-text-inverse`, `mt-8`) e o componente `<Text variant="...">`. Exceções legítimas precisam de comentário e aprovação.

**Pare e peça aprovação humana antes de:** alterar `packages/ui/` (design system), adicionar pacote externo (`pnpm add`), ou importar um domínio dentro de outro.

**Antes de abrir PR, garanta a [Definition of Done](definition-of-done.md):** `pnpm lint`, `pnpm typecheck` e `pnpm build` passando, e — para componentes de UI — story no Storybook.

---

## Onde achar cada regra

| Preciso de… | Vá para |
|---|---|
| Visão geral e regras de aprovação | [AGENTS.md](../../AGENTS.md) |
| Critérios de merge verificáveis | [definition-of-done.md](definition-of-done.md) |
| Quando usar chat vs agente | [como-usar-ia.md](como-usar-ia.md) |
| Revisar um PR com IA | [code-review.md](code-review.md) |
| Porquê das decisões | [ADRs](../adr/README.md) |
| Como implementar (tokens, layout, código, a11y) | [conventions/](../conventions/) |
| Versionamento, branches e PR | [CONTRIBUTING.md](../../CONTRIBUTING.md) |
