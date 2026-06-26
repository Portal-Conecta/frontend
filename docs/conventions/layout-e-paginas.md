# Convenção: Layout e Páginas

**Público:** squads operacionais (consumo do shell em telas de módulo).

> Status: o AppLayout está **entregue** (`packages/core/src/layout/AppLayout.tsx`) e seu contrato está fixado na [ADR-0012](../adr/ADR-0012-contrato-do-applayout.md). A API descrita abaixo é estável. Apenas a montagem de tela de módulo (página + rota) segue **provisória** e fecha com o piloto de Comunicados.

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
| `onMoreOptionsClick` | `() => void?` | Clique em "mais opções" (header). |

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

## Onde a página do módulo vive (provisório)

> Esta seção fecha com o piloto de Comunicados. Não trate como contrato final.

O padrão pretendido: o domínio é dono das suas páginas em `packages/[dominio]/src/pages`, e o `apps/root` registra a rota (App Router) apontando para essa página, já protegida por auth via middleware. O wiring exato (rota fina em `apps/root` consumindo a page do domínio) será validado e documentado com o primeiro módulo. Até lá, alinhe com o squad Front antes de criar um novo padrão de página ou rota.
