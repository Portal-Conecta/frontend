# AGENTS.md — Portal Conecta Frontend

Ponto de entrada para agentes e desenvolvedores. Leia antes de qualquer implementação.

**Stack:** Next.js 15 · React 19 · TypeScript estrito · Tailwind CSS v4 · pnpm workspaces

→ [Índice de ADRs](docs/adr/README.md) · [Commits, branches e PR](CONTRIBUTING.md)

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

→ [Guia de criação de componentes](docs/guides/creating-components.md)

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

→ [Guia completo de tokens](docs/tokens.md)

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
| `Button` sem `tone="overlay"` | `packages/ui/src/atoms/Button/Button.tsx` | Variante para fundo colorido — override pontual em `PageLogin` com `className` |
| Border radius 24px sem token | `packages/ui/src/tokens/radius.ts` | Adicionar `xl: '1.5rem'` após aprovação do DS |
| `body/sm-emphasis` font family | `scripts/sync-tokens.ts` | Correção hardcoded no script — depende de ajuste no Figma DS |

→ [Como registrar e tratar dívidas de token](docs/guides/token-debt.md)
