# ADR-0011: Navegação do Storybook por Categoria Funcional

## Status
Aceita

## Data
2026-06-25

## Contexto

O menu do Storybook hoje espelha as camadas do Atomic Design — `Atoms`, `Molecules`, `Organisms` —, conforme registrado como consequência da [ADR-0005](ADR-0005-atomic-design-ui.md) e da [ADR-0007](ADR-0007-storybook.md). Essa decisão fazia sentido quando o `@portal/ui` tinha poucos componentes, mas mostra duas fraquezas conforme o DS amadurece:

- **O nível atômico é uma preocupação de quem mantém o código, não de quem consome o DS.** Quem busca um componente pensa "preciso de um input", não "preciso de uma molecule". Agrupar por camada obriga o consumidor a saber a classificação interna para achar o que quer.
- **A classificação atômica é instável.** O ciclo de vida descrito no AGENTS.md prevê que um componente nasça em um domínio e seja promovido a `atom` ou `molecule`. Cada promoção move o componente de lugar no menu e quebra links e memória muscular.

A referência madura que adotamos como norte é o Design System da WEG, cujo Storybook organiza por função (`Buttons`, `Inputs`, `Form`, `Feedback`, `Overlay`, `Navigation`, `Typography`...) e aninha famílias de componentes (`Inputs/Input/Checkbox`).

Alternativas consideradas:
- **Manter a navegação atômica e investir só em documentação:** mais barato, mas não resolve a fricção de descoberta nem a instabilidade dos links.
- **Reorganizar também as pastas do código por função:** alinharia código e menu, mas conflita com a [ADR-0004](ADR-0004-arquitetura-em-camadas.md) e com o ciclo de vida de promoção do AGENTS.md, além de ser uma migração de alto risco.

## Decisão

A navegação do Storybook passa a ser organizada por **categoria funcional**, desacoplada da estrutura de pastas do código. O `title:` de cada story deixa de espelhar a camada atômica.

Esta decisão **não altera** a [ADR-0005](ADR-0005-atomic-design-ui.md): o código permanece em `atoms/`, `molecules/` e `organisms/`, com as mesmas fronteiras de importação. Muda apenas o `title:` das stories e o `storySort` em `.storybook/preview.ts`.

Vocabulário de categorias (fechado), todas sob o grupo `Componentes`:

```
Componentes/Ações        → Button
Componentes/Inputs       → Input e a família Input/* (Checkbox, Radio, Textarea, Select)
Componentes/Formulário   → FormField
Componentes/Feedback     → Alert, Skeleton
Componentes/Overlay      → Toast
Componentes/Navegação    → Sidebar, SidebarNavItem, AppHeader, AppFooter
Componentes/Conteúdo     → Text, Icon, Logo
Componentes/Layout       → AppLayout
```

Regras:
- Um controle que pertence a uma família aninha sob ela no `title:` (ex. `Componentes/Inputs/Input/Checkbox`). O agrupamento de família existe apenas na navegação — no código os controles seguem como `atoms` planos, preservando o tree-shaking.
- O wrapper `FormField` fica em `Formulário`, separado dos controles de input.
- Toda story usa exatamente uma categoria do vocabulário fechado. Adicionar categoria nova exige atualizar este ADR.
- Ordem do `storySort`: `Sobre`, `Fundação`, `Componentes`.

## Consequências

**Positivo:**
- A navegação reflete o modelo mental de quem consome o DS — descoberta por função, não por classificação interna.
- Promover um componente de `atom` para `molecule` no código não muda mais o lugar dele no menu, eliminando a quebra de links a cada promoção.
- O agrupamento por família (`Input/*`) mantém componentes parentes juntos e documentados lado a lado.
- O código continua atômico: a ADR-0004 e a ADR-0005 seguem válidas sem qualquer mudança de pasta.

**Negativo:**
- O `title:` deixa de ser derivável do caminho do arquivo, então passa a ser uma convenção que o time precisa manter manualmente e revisar em PR.
- A migração inicial muda as URLs das stories existentes, quebrando links antigos para o Storybook uma única vez.
- A "aula" de Atomic Design que o menu antigo passava some da navegação; o conceito segue documentado na seção `Sobre` e nos ADRs.
- Substitui a consequência da ADR-0005 e da ADR-0007 de que "as histórias são organizadas pelos mesmos três níveis do Atomic Design".
