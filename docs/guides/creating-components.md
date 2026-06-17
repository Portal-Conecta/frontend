# Guia de Criação de Componentes — @portal/ui

Este guia cobre o fluxo completo para criar um novo atom ou molecule no design system.
Leia o [AGENTS.md](../../AGENTS.md) e o [ADR-005](../adr/ADR-005-atomic-design-ui.md) antes de começar.

---

## 1. Decidir a camada

**Atom** — elemento indivisível com uma única responsabilidade. Não compõe outros componentes do DS (pode usar elementos HTML nativos).

> Exemplos: `Button`, `Input`, `Text`, `Icon`, `Badge`, `Spinner`

**Molecule** — composição simples de dois ou mais atoms. Ainda cabe em uma visualização direta no Storybook.

> Exemplos: `Alert` (barra + Text), `InputField` (label + Input + mensagem de erro)

Se o componente compõe molecules ou representa uma seção inteira de UI, é um **organism** — siga o mesmo fluxo, mas coloque em `packages/ui/src/organisms/`.

Quando estiver em dúvida entre atom e molecule: se o componente importa outro componente do DS, é molecule.

---

## 2. Estrutura de arquivos

```
packages/ui/src/atoms/NomeDoComponente/
├── NomeDoComponente.tsx        ← implementação
├── NomeDoComponente.stories.tsx ← stories do Storybook
└── index.ts                    ← re-exporta tudo
```

Nomes sempre em PascalCase. O diretório tem o mesmo nome do componente.

---

## 3. Anatomia do arquivo de componente

Siga esta ordem dentro do arquivo:

```tsx
// 1. 'use client' — só se necessário (ver AGENTS.md)
'use client'

// 2. imports — tipos primeiro, depois módulos
import type { HTMLAttributes, ReactNode } from 'react'

// 3. tipos e interfaces exportados — antes da implementação
export type BadgeVariant = 'success' | 'error' | 'warning' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

// 4. constantes de estilo — Record<> tipado, nunca inline na função
const variantClass: Record<BadgeVariant, string> = {
  success: 'bg-feedback-success text-text-inverse',
  error:   'bg-feedback-error   text-text-inverse',
  warning: 'bg-feedback-warning text-text-primary',
  info:    'bg-feedback-info    text-text-inverse',
}

// 5. função nomeada e exportada — nunca anônima
export function Badge({ variant = 'info', className, children, ...rest }: BadgeProps) {
  const classes = ['inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-inter', variantClass[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
```

---

## 4. Regras de props

Props refletem decisões do Design System, não propriedades CSS.

- Cada variante visual documentada no Figma vira uma opção do tipo union
- Cores nunca são prop — estão embutidas na variante
- Estados CSS nativos (hover, focus, active) não viram props — são pseudo-classes
- Estados que exigem lógica JS (loading, disabled com comportamento especial) viram props booleanas
- Aceite `className` via spread para ajustes de layout externo, nunca para sobrescrever estilo interno

```tsx
// ✅ prop reflete decisão do DS
variant?: 'success' | 'error' | 'warning' | 'info'

// ❌ prop expõe CSS
color?: string
backgroundColor?: string
```

---

## 5. Exportar no barrel

Após criar o componente, adicione a exportação em dois lugares:

```ts
// packages/ui/src/atoms/NomeDoComponente/index.ts
export * from './NomeDoComponente'
```

```ts
// packages/ui/src/atoms/index.ts — adicionar linha:
export * from './NomeDoComponente'
```

Após isso, `import { NomeDoComponente } from '@portal/ui'` funciona em qualquer pacote do monorepo.

---

## 6. Stories

Toda novo componente em `@portal/ui` precisa de ao menos uma story antes do merge.

```tsx
// NomeDoComponente.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['success', 'error', 'warning', 'info'] },
  },
  args: { children: 'Label', variant: 'info' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Badge {...args} variant="success">Sucesso</Badge>
      <Badge {...args} variant="error">Erro</Badge>
      <Badge {...args} variant="warning">Aviso</Badge>
      <Badge {...args} variant="info">Info</Badge>
    </div>
  ),
}
```

Critérios para adicionar uma story: cada variante visual distinta, estados difíceis de reproduzir no app (error, disabled, loading), e contexto que muda o significado visual (ex: fundo colorido com decorator).

→ [ADR-007 — Storybook](../adr/ADR-007-storybook.md)

---

## 7. Checklist antes do PR

- [ ] Componente está na camada correta (atom, molecule ou organism)
- [ ] Estrutura de arquivos segue o padrão (`ComponentName/ComponentName.tsx` + `index.ts` + `stories`)
- [ ] Props refletem o DS — sem `color`, `backgroundColor` ou similares
- [ ] Nenhum token hardcodado (sem hex, sem `text-[Npx]`)
- [ ] Exportado no barrel da camada e no barrel do `@portal/ui`
- [ ] Ao menos uma story cobrindo as variantes principais
- [ ] `'use client'` presente somente se o componente usa hooks ou event handlers
- [ ] PR tem aprovação de ao menos um integrante do squad de Front-End
