# Convenção: Layout e Páginas

**Público:** squads operacionais (consumo do shell em telas de módulo).

> Status: o AppLayout está em fechamento (AppHeader em andamento). Esta convenção fixa os princípios estáveis; a montagem completa de tela de módulo (página + rota) está marcada como **provisória** e será finalizada com o piloto de Comunicados. A API concreta do AppLayout acompanha a entrega do componente.

## O que é o AppLayout

O AppLayout é o shell padrão de toda página interna autenticada. Vive em `@portal/core` (`packages/core/src/layout/`) e compõe três organismos do DS, `AppHeader` (topo), `Sidebar` (navegação lateral) e `AppFooter` (rodapé), com um slot de conteúdo no centro.

Os squads não montam o shell; apenas embrulham o conteúdo da tela nele.

## Princípios estáveis (já valem)

- **Sidebar controlada pelo shell.** O estado `expanded` vive no AppLayout, não na Sidebar. O shell sincroniza header, sidebar, footer e área de conteúdo a partir desse único estado. A tela não gerencia esse estado.
- **Breakpoint de layout é do shell.** Corte em `lg` (1024px): acima, rail persistente que empurra o conteúdo; abaixo, drawer sobreposto ou FAB. A tela não reimplementa esse comportamento.
- **Navegação sem acoplamento a framework.** Os itens de navegação recebem `onClick` e `activeKey` (ver [ADR-0004](../adr/ADR-0004-arquitetura-em-camadas.md)); a tela liga isso ao roteamento do módulo.
- **Dimensões de layout vêm de token/constante do DS**, nunca hardcoded.

## Como usar (ilustrativo)

A tela do módulo importa o AppLayout de `@portal/core`, passa os itens de navegação e embrulha o conteúdo composto de primitivos do `@portal/ui`:

```tsx
import { AppLayout } from '@portal/core'

export function MinhaTela() {
  return (
    <AppLayout /* itens de navegação + chave ativa */>
      {/* conteúdo da tela, só primitivos do @portal/ui */}
    </AppLayout>
  )
}
```

O nome exato das props é confirmado na entrega do AppLayout.

## Onde a página do módulo vive (provisório)

> Esta seção fecha com o piloto de Comunicados. Não trate como contrato final.

O padrão pretendido: o domínio é dono das suas páginas em `packages/[dominio]/src/pages`, e o `apps/root` registra a rota (App Router) apontando para essa página, já protegida por auth via middleware. O wiring exato (rota fina em `apps/root` consumindo a page do domínio) será validado e documentado com o primeiro módulo. Até lá, alinhe com o squad Front antes de criar um novo padrão de página ou rota.
