# ADR-0012: Contrato do AppLayout

## Status
Aceita

## Data
2026-06-26

## Contexto

Toda página interna autenticada do Portal Conecta compartilha a mesma moldura: cabeçalho no topo, navegação lateral e rodapé, com a tela do módulo no centro. Sem um shell padrão, cada squad operacional remontaria esses organismos por conta própria, divergindo em estado, breakpoint e dimensões — e duplicando lógica de acessibilidade (foco do drawer, FAB, teclado).

Três tensões precisavam de uma decisão registrada, não apenas de código:

- **Onde mora o estado da sidebar.** Header, rail, conteúdo e rodapé precisam animar em lockstep entre colapsado e expandido. Se cada um guardasse seu próprio estado, eles dessincronizariam.
- **Acoplamento a framework.** A navegação não pode depender do roteador do Next.js dentro do `@portal/ui`/`@portal/core`, sob pena de violar a [ADR-0004](ADR-0004-arquitetura-em-camadas.md) e travar a reutilização entre domínios.
- **Quem é dono do layout estrutural** (breakpoint, dimensões do rail, borda da moldura): o shell ou a tela. Se a tela puder reimplementar isso, o contrato vaza e cada módulo fica diferente.

O componente foi entregue (`packages/core/src/layout/AppLayout.tsx`); esta ADR fixa o contrato que ele estabelece para os consumidores.

## Decisão

O **AppLayout** é o shell padrão e obrigatório de toda página interna autenticada. Vive em `@portal/core` (`packages/core/src/layout/`) e compõe três organismos do `@portal/ui` — `AppHeader`, `Sidebar` e `AppFooter` — ao redor de um slot de conteúdo. Os squads embrulham a tela; não remontam o shell.

**Fonte única do estado `expanded`.** O estado de colapso da sidebar vive no AppLayout e é propagado para header, rail, conteúdo e rodapé. A `Sidebar` é um organismo *controlado* (recebe `expanded`/`onToggle`); a tela não gerencia esse estado.

**Controle de colapso único.** No desktop, o toggle "Reduzir" vive no `leftSlot` do rodapé; por isso a `Sidebar` entra com `railToggle={false}`, evitando dois controles. No tablet/mobile, o FAB e o drawer da própria Sidebar cuidam disso.

**Breakpoint e dimensões são do shell.** O corte em `lg` (1024px) e as larguras do rail vêm de constantes/tokens do DS (`SIDEBAR_WIDTH_*`), nunca hardcoded. A tela não reimplementa breakpoint nem mede o rail.

**Navegação desacoplada de framework.** Os itens chegam como `SidebarItem[]` (`{ key, icon, label, onClick? }`) e o item ativo como `activeKey` (ver [ADR-0004](ADR-0004-arquitetura-em-camadas.md)). A tela liga `onClick`/`activeKey` ao roteamento do seu módulo; o shell não importa o roteador do Next.

**A borda da moldura é do shell.** A borda (`border-border-default`) e o canto arredondado do painel de conteúdo moram no `<main>` do AppLayout, não nos organismos — por isso a Sidebar não desenha mais `border-r`.

O contrato público (`AppLayoutProps`):

| Prop | Tipo | Papel |
|---|---|---|
| `children` | `ReactNode` | Conteúdo da tela (área central rolável). |
| `items` | `SidebarItem[]` | Itens de navegação da sidebar. |
| `activeKey` | `string?` | Key do item ativo. |
| `defaultExpanded` | `boolean?` | Estado inicial; default colapsado (`false`). |
| `onLogoClick` | `() => void?` | Clique na logo (home). |
| `onProfileClick` | `() => void?` | Clique no perfil. |
| `onNotificationsClick` | `() => void?` | Clique nas notificações. |

> **Atualização (2026-07-16):** o ícone "mais opções" (ellipsis) foi removido do `AppHeader` — nenhuma tela consumia `onMoreOptionsClick`. A prop foi retirada do contrato (`AppHeaderProps`/`AppLayoutProps`); a tabela acima já reflete o contrato atual.

A montagem da página do módulo e o registro da rota em `apps/root` que consome esse shell ficam fora desta ADR — serão fixados com o piloto de Comunicados (ver [layout-e-paginas](../conventions/layout-e-paginas.md)).

## Consequências

**Positivo:**
- Toda tela interna herda a mesma moldura, estado sincronizado e comportamento responsivo sem reimplementar nada.
- O estado `expanded` em um lugar só elimina dessincronização entre header, rail, conteúdo e rodapé.
- A navegação por `onClick`/`activeKey` mantém o shell livre do roteador, preservando a fronteira de camadas da ADR-0004.
- A11y do overlay (foco, `Esc`, FAB) fica concentrada no shell, não espalhada por cada módulo.

**Negativo:**
- O AppLayout passa a ser ponto de acoplamento: mudar o contrato (`AppLayoutProps`) afeta todos os módulos, exigindo revisão do squad Front (governança da [ADR-0010](ADR-0010-governanca-ci-como-portao.md)).
- A flexibilidade da tela é intencionalmente limitada — breakpoint, dimensões e moldura não são configuráveis pelo consumidor por design.
- A ligação tela↔rota (page do domínio consumida por `apps/root`) ainda não está fechada; até o piloto, o padrão de página é provisório.

## Referências

- [ADR-0004: Arquitetura em Camadas](ADR-0004-arquitetura-em-camadas.md)
- [ADR-0010: Governança e CI como Portão](ADR-0010-governanca-ci-como-portao.md)
- [Convenção: Layout e Páginas](../conventions/layout-e-paginas.md)
- `packages/core/src/layout/AppLayout.tsx`
