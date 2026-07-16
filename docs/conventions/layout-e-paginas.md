# Convenção: Layout e Páginas

**Público:** squads operacionais (consumo do shell em telas de módulo).

> Status: o AppLayout está **entregue** (`packages/core/src/layout/AppLayout.tsx`) e seu contrato está fixado na [ADR-0012](../adr/ADR-0012-contrato-do-applayout.md). A montagem de tela de módulo (página + rota) foi **fechada** com a #405: o shell é montado uma única vez no layout do grupo `(authenticated)` — ver "Onde a página do módulo vive" abaixo.

## O que é o AppLayout

O AppLayout é o shell padrão de toda página interna autenticada. Vive em `@portal/core` (`packages/core/src/layout/`) e compõe três organismos do DS, `AppHeader` (topo), `Sidebar` (navegação lateral) e `AppFooter` (rodapé), com um slot de conteúdo no centro.

Os squads não montam o shell; apenas embrulham o conteúdo da tela nele.

## Princípios estáveis

- **Sidebar controlada pelo shell.** O estado `expanded` vive no AppLayout, não na Sidebar. O shell sincroniza header, sidebar, footer e área de conteúdo a partir desse único estado. A tela não gerencia esse estado.
- **Controle de colapso único.** No desktop, o toggle "Reduzir" fica no rodapé; no tablet/mobile, no FAB e no drawer da Sidebar. A tela não adiciona outro toggle.
- **Breakpoint de layout é do shell.** Corte em `lg` (1024px): acima, rail persistente que empurra o conteúdo; abaixo, drawer sobreposto ou FAB. A tela não reimplementa esse comportamento.
- **Navegação sem acoplamento a framework.** Os itens de navegação recebem `onClick` e `activeKey` (ver [ADR-0004](../adr/ADR-0004-arquitetura-em-camadas.md)); a tela liga isso ao roteamento do módulo.
- **Dimensões de layout vêm de token/constante do DS** (`SIDEBAR_WIDTH_*`), nunca hardcoded.

## API (`AppLayoutProps`)

| Prop | Tipo | Papel |
|---|---|---|
| `children` | `ReactNode` | Conteúdo da tela (área central rolável). |
| `items` | `SidebarItem[]` | Itens de navegação da sidebar (`{ key, icon, label, onClick? }`). |
| `activeKey` | `string?` | Key do item de navegação ativo. |
| `defaultExpanded` | `boolean?` | Estado inicial da sidebar. Default colapsado (`false`). |
| `onLogoClick` | `() => void?` | Clique na logo do header (navegação para a home). |
| `onProfileClick` | `() => void?` | Clique no perfil (header). |
| `onNotificationsClick` | `() => void?` | Clique nas notificações (header). |

## Como usar

A tela do módulo importa o AppLayout de `@portal/core`, passa os itens de navegação e a chave ativa, e embrulha o conteúdo composto de primitivos do `@portal/ui`:

```tsx
import { AppLayout } from '@portal/core'
import type { SidebarItem } from '@portal/ui'

const items: SidebarItem[] = [
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados', onClick: () => navegar('/comunicados') },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala', onClick: () => navegar('/mapa-salas') },
]

export function MinhaTela() {
  return (
    <AppLayout items={items} activeKey="comunicados">
      {/* conteúdo da tela, só primitivos do @portal/ui */}
    </AppLayout>
  )
}
```

## Onde a página do módulo vive

Contrato final (fechado na #405, após o piloto de Comunicados):

- **O domínio é dono das suas páginas** em `packages/[dominio]/src/pages`, e o `apps/root` registra a rota com uma rota fina dentro do grupo `apps/root/src/app/(authenticated)/[rota]/page.tsx` (re-export ou wrapper que só repassa `params`/`searchParams`). A proteção de auth vem do middleware.
- **O shell é montado uma única vez** em `apps/root/src/app/(authenticated)/layout.tsx`, que resolve `getCurrentUser()` e renderiza o `AppShell`. Como subárvore de layout, o shell **persiste entre navegações** — header/sidebar/menu não remontam, o estado `expanded` sobrevive e a contagem de não-lidas não refetcha por rota.
- **A página renderiza só o conteúdo** — nunca importa `AppShell` nem resolve usuário "para o shell". Se o conteúdo precisa do `CurrentUser` (gates, filtros por papel), a própria página chama `getCurrentUser()` — é parse puro de cookie, sem I/O.
- **O item ativo da nav é derivado da rota** (`activeKeyFromPathname` sobre o `NAV_REGISTRY`, dentro do `AppShell`) — não é responsabilidade da tela.
- **`loading.tsx` é content-only**: só o skeleton do conteúdo, sem shell — o shell real já está na tela durante o Suspense.
- **404/erro dentro do grupo são content-only**: `(authenticated)/not-found.tsx` e `(authenticated)/error.tsx` renderizam a mensagem dentro do shell persistente. Os boundaries da raiz cobrem URL fora de qualquer rota e falhas do próprio layout.
