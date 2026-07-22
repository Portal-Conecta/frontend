# AGENTS.md — Portal Conecta Frontend

Ponto de entrada para agentes e desenvolvedores. Leia antes de qualquer implementação.

**Stack:** Next.js 15 · React 19 · TypeScript estrito · Tailwind CSS v4 · pnpm workspaces

→ [Índice de docs](docs/README.md) · [Índice de ADRs](docs/adr/README.md) · [Commits, branches e PR](CONTRIBUTING.md) · [Rubric de revisão de PR](REVISION.md)

**Antes de delegar a um agente, leia os guardrails:** [Context pack](docs/ai/ai-context.md) · [Definition of Done](docs/ai/definition-of-done.md) · [Como usar IA](docs/ai/como-usar-ia.md) · [Rubric de revisão de PR](REVISION.md)

**AGENTS por domínio:** [checklist](packages/checklist/AGENTS.md) · [comunicados](packages/comunicados/AGENTS.md) · [mapa-salas](packages/mapa-salas/AGENTS.md)

---

## Mapa de pacotes

```
@portal/shared    ← base: tipos e utilitários puros, sem React
@portal/ui        ← design system: tokens, atoms, molecules, organisms
@portal/core      ← infraestrutura: auth, layout, roteamento, RBAC
@portal/[domínio] ← features: checklist · comunicados · mapa-salas
apps/root         ← shell Next.js: registra rotas, importa domínios
```

Cada camada importa apenas das camadas abaixo. Domínios nunca importam outros domínios — a violação quebra o CI. Lógica compartilhada entre domínios vai para `@portal/shared` (utilitário genérico) ou `@portal/core` (infraestrutura de negócio).

→ [ADR-0004 — Arquitetura em Camadas](docs/adr/ADR-0004-arquitetura-em-camadas.md)

---

## Regras que exigem aprovação humana

Pare e consulte antes de agir nestes casos:

1. **Modificar `packages/ui/`** — qualquer PR que altere o design system exige aprovação de ao menos um integrante do squad de Front-End.
2. **Adicionar pacote externo** — alinhe com o Tech Lead de Front-End antes do `pnpm add`. Verifique se o que você precisa já existe no monorepo.
3. **Importar domínio dentro de outro domínio** — proibido por ESLint. Se precisar de algo cross-domain, mova para `@portal/shared` ou `@portal/core`.

---

## Ciclo de vida de componentes

Componentes podem nascer dentro de um módulo de domínio quando ainda são experimentais ou específicos de uma feature:

```
packages/[domínio]/src/components/MeuComponente.tsx   ← nasce aqui
```

Quando o squad de Front-End aprovar a generalização, o componente migra para o design system:

```
packages/ui/src/atoms/MeuComponente/   ← atom indivisível
packages/ui/src/molecules/MeuComponente/   ← se compõe outros atoms
```

O PR de migração exige ao menos um aprovador do squad de Front-End e uma story no Storybook.

→ [Guia de criação de componentes](docs/conventions/creating-components.md)

---

## Tokens

Se existe um token, use o token. Hex cru, tamanho de fonte arbitrário e valores fora da escala de espaçamento não entram no código.

```tsx
// ✅
<div className="bg-interactive-default text-text-inverse mt-8" />
<Text variant="heading-h1" tone="inverse">Título</Text>

// ❌
<div className="bg-[#01258F] text-[#FFF] mt-[32px]" />
<p className="text-[48px] font-semibold">Título</p>
```

**Única exceção:** o gradiente do `AuthLayout` usa primitivos `blue/300` e `blue/500` diretamente — Tailwind não suporta gradiente via token semântico. Toda nova exceção exige comentário explicando o motivo e aprovação do Tech Lead.

→ [Guia completo de tokens](docs/conventions/tokens-e-theming.md)

---

## `'use client'` — Server Component é o padrão

Não adicione `'use client'` por precaução. O critério é objetivo: o arquivo usa `useState`, `useEffect`, `useRef` ou define event handler direto.

```tsx
// Server Component — padrão, sem declaração
export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="...">{children}</div>
}

// Client Component — só quando necessário
'use client'
export function LoginForm() {
  const [email, setEmail] = useState('')
  // ...
}
```

---

## Dívidas técnicas conhecidas

| Item | Localização | O que falta |
|---|---|---|
| `Visual Regression` ainda não é check obrigatório da `develop` | proteção da branch `develop` | Resquício da desativação do Chromatic em 2026-07-10 (incidente no Capture Cloud travou a fila de Actions). O trigger `on: push` do workflow **já foi restaurado** em 2026-07-21 (#453), após `status.chromatic.com` voltar a "operational". Falta só devolver `Visual Regression` aos status checks obrigatórios — hoje são `Lint`, `Type Check`, `Build`. Adiado de propósito: tornar o check obrigatório antes de existir um build verde na `develop` trava todas as PRs abertas, que é justamente o que a desativação evitou. **Bloqueio tratado em #453, falta confirmar num build:** os builds após a reativação rodaram até o fim (~1m20s, o sintoma do incidente sumiu) mas falharam com o que o log do CI agrega como "9 component errors". São dois defeitos distintos, ambos nascidos na janela sem gate visual: **6 erros de render** no `AnnouncementFeed` (o `AnnouncementFeedContent` — metade apresentacional do par — chamava `useRouter` do `next/navigation`; sem `parameters.nextjs.appDirectory: true` o `@storybook/nextjs` monta o Pages Router e o hook lança `invariant expected app router to be mounted`) e **3 failed tests** nas stories da `SearchBar` que têm `play` (#435). Ambos foram **corrigidos em #453**: no `AnnouncementFeed` a navegação subiu para as props `onOpenManagement`/`onCreate`, como o `MyAnnouncementsTableContent` já fazia; nas stories da `SearchBar` os asserts de `toBeVisible()` passaram a rodar dentro de `waitFor`, porque a lista entra no DOM ainda em `opacity-0` e a asserção corria contra a transição de 150ms (alteração em `packages/ui` autorizada pelo TL de Front-End). Falta confirmar num build real que a contagem foi a zero. Por que não se curavam sozinhos: erro não gera snapshot, sem snapshot não há baseline, e sem baseline o TurboSnap não pode copiar — a story volta para a fila de execução em todo build e erra de novo. Reproduzem local (o `pnpm test:a11y` não os isola porque o vermelho de a11y — `color-contrast`, dívida #104 — domina a saída): sirva o `storybook-static` e visite `iframe.html?id=<story>&viewMode=story` num Playwright, escutando `page.on('pageerror')`. Zerar as 3 restantes é pré-requisito de tornar o check obrigatório. **Reverter:** zerar os component errors; confirmar que o check `Visual Regression` aparece verde numa PR real; então `gh api repos/Portal-Conecta/frontend/branches/develop/protection/required_status_checks -X PATCH -f contexts[]='Lint' -f contexts[]='Type Check' -f contexts[]='Build' -f contexts[]='Visual Regression'` (Settings → Branches → develop também serve) — a proteção hoje tem `strict: true`, conferir com um `GET` que o PATCH preservou a flag; remover esta linha. |
| `Button` sem `tone="overlay"` | `packages/ui/src/atoms/Button/Button.tsx` | Variante para fundo colorido — override pontual em `PageLogin` com `className` |
| `body/sm-emphasis` font family | `scripts/sync-tokens.ts` | Correção hardcoded no script — depende de ajuste no Figma DS |
| Focus-trap inline na `Sidebar` | `packages/ui/src/organisms/Sidebar/Sidebar.tsx` | Bug de re-render já corrigido (`onToggle` em ref, efeito só depende de `expanded`). Falta extrair `useDrawerFocusTrap(panelRef, { active, onClose })` — isola a11y do layout e abre para teste (DoD [#105](https://github.com/Portal-Conecta/frontend/issues/105)) |
| `logoPadding` do `AppHeader` espelha o padding do `SidebarNavItem` | `packages/ui/src/organisms/AppHeader/AppHeader.tsx` | Promover `pl-4`/`pl-8` a constante compartilhada (`tokens/layout.ts`) — hoje desalinha se um dos dois mudar |
| Toggle "Reduzir" duplicado (rail, drawer e `leftSlot` do footer) | `packages/ui/src/organisms/Sidebar/Sidebar.tsx` · `packages/core/src/layout/AppLayout.tsx` | Extrair molecule `SidebarToggle` (ícone `chevrons-left/right` + label) reusado pelos três |
| Valor preenchido / texto de lista usa `text-text-brand` (blue/500) | `packages/ui/src/atoms/DateInput/DateInput.tsx` · `packages/ui/src/atoms/TimeInput/TimeInput.tsx` · `packages/core/src/courses/components/CourseRow/CourseRow.tsx` · `packages/core/src/users/components/UserRow/UserRow.tsx` | Figma pede blue/700 no preenchido/texto, mas não há token de texto blue/700 (só `interactive-hover`). Promover token de texto ou confirmar blue/500 — issue [#241](https://github.com/Portal-Conecta/frontend/issues/241) |
| Escala `display-*` e `tracking-display` ainda não existem no Figma DS | `packages/ui/src/tokens/typography.ts` | Tokens promovidos no código (aprovação TL, #174) por reuso nas páginas de erro; falta o designer criar as variáveis na coleção Typography do Figma DS para o próximo `pnpm sync:tokens` bater com o código |
| Escala `heading-h1`/`h2`/`h3` divergente do Figma DS | `packages/ui/src/tokens/typography.ts` | Tamanhos trocados de 48/36/24px para 32/28/24px (aprovação TL, #328) — alinhamento com a escala Headline do Material Design 3 (Large/Medium/Small), reduzindo o peso visual dos títulos no app. Falta o designer atualizar h1/h2 e criar h3 na coleção Typography do Figma DS para o próximo `pnpm sync:tokens` bater com o código |
| Logout offline não limpa o cookie de sessão | `packages/core/src/layout/AppShell.tsx` (`handleLogout`) | O `POST /api/auth/logout` roda `clearSession()` incondicionalmente mesmo se o gateway falhar — isso já está coberto. O que sobra é o `fetch` nem sair do browser (offline de fato, ou o Next inacessível): o cookie `access_token` é httpOnly, então o client não tem como limpá-lo sem um round-trip ao server que por definição não aconteceu nesse cenário. O redirect para `/login` é só client-side e pode ser revertido pelo middleware na próxima navegação enquanto a sessão continuar válida no server. Corrigir exigiria um mecanismo de limpeza que não depende de um request bem-sucedido (fora de escopo por ora) — issue #328 |
| `ProfileMenu` sem teste de componente | `packages/core/src/layout/ProfileMenu.tsx` | Cobre lógica não-trivial (cache em módulo, clique-fora, `Esc` via `useFocusTrap`, fallback de fetch) sem nenhum teste automatizado. Bloqueado em infra: `vitest.config.ts` da raiz roda só `environment: 'node'` e `include` só casa `*.test.ts` — não existe ainda `@testing-library/react`/jsdom no monorepo (seria o primeiro teste de componente). Adicionar a dependência exige alinhamento prévio de TL (`pnpm add`, regra do AGENTS.md) — issue #328 |

→ [Como registrar e tratar dívidas de token](docs/conventions/tokens-e-theming.md)
