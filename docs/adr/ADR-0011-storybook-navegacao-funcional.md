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
Componentes/Inputs       → Input e a família Input/* (Checkbox, Radio, Textarea); subgrupo próprio Select/* (ver Adendo 2026-06-26 #2)
Componentes/Formulário   → Field (wrapper de campo; ver Adendo 2026-06-26 #3)
Componentes/Feedback     → Alert, Skeleton
Componentes/Overlay      → Toast
Componentes/Navegação    → Sidebar, SidebarNavItem, AppHeader, AppFooter
Componentes/Conteúdo     → Text, Icon, Logo
Componentes/Data        → Tag
Componentes/Layout       → AppLayout
```

Regras:
- Um controle que pertence a uma família aninha sob ela no `title:` (ex. `Componentes/Inputs/Input/Checkbox`). O agrupamento de família existe apenas na navegação — no código os controles seguem como `atoms` planos, preservando o tree-shaking.
- O wrapper de campo `Field` fica em `Componentes/Formulário/Field`, separado dos controles de input (ver Adendo 2026-06-26 #3).
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

## Adendo (2026-06-26)

A categoria **`Formulário`** é **removida** do vocabulário fechado. O wrapper `FormField` passa a aninhar em **`Componentes/Inputs/Input/FormField`**, junto dos demais controles da família. Este adendo **supera** o mapeamento `FormField → Formulário` originalmente validado pela WEG e a regra de mantê-lo "separado dos controles de input".

No mesmo movimento, o `Input` base — antes uma story solta em `Componentes/Inputs/Input` — vira leaf do grupo, em **`Componentes/Inputs/Input/Input`**, espelhando o tratamento já dado ao `Checkbox`. O grupo `Inputs/Input/*` passa a reunir, lado a lado, o controle base, os controles da família e o wrapper `FormField`.

Consequências:
- O array de ordem do `storySort` em `.storybook/preview.ts` deixa de listar `'Formulário'`.
- A introdução (`.storybook/Introducao.mdx`) descreve o `FormField` dentro de **Inputs**, não mais numa categoria própria.
- Como em toda mudança de vocabulário, o código permanece atômico: `FormField` segue como `molecule` em `packages/ui/src/molecules/` — só o `title:` da story muda.

## Adendo 2026-06-26 #2

O **Select** sai da lista plana de `Input/*` e passa a ter **subgrupo próprio `Componentes/Inputs/Select/*`**. Diferente dos demais controles (Checkbox, Radio, Textarea), o Select é uma **família**: além do controle base ele terá variantes irmãs (`SelectAsync`, futuro `Creatable`), como no DS WEG de referência. Aninhá-las como folhas planas de `Input/*` (`Inputs/Input/SelectAsync`) misturaria a família com os controles simples; o subgrupo as mantém juntas.

Estrutura:

```
Componentes/Inputs/Select/Select        → controle base (seleção única; multi, clearable e group label como stories/props)
Componentes/Inputs/Select/SelectAsync   → variante com carregamento assíncrono (fase seguinte)
(futuro) Componentes/Inputs/Select/Creatable
```

Consequências:
- Reverte a inclusão de `Select` na enumeração de `Input/*` feita no adendo anterior; o Select agora é a única família de input com subgrupo próprio.
- No código o Select é uma `molecule` (`packages/ui/src/molecules/Select/`) por compor um dropdown próprio — diferente dos controles que são `atoms` planos. O `title:` continua desacoplado da pasta.
- Não há mudança no `storySort`: o subgrupo aninha sob `Inputs`, cuja ordem já está fixada.

## Adendo 2026-06-26 #3

A categoria **`Formulário`** é **reintroduzida** no vocabulário fechado, **revertendo o Adendo #1**. O wrapper de campo sai de `Componentes/Inputs/Input/FormField` e passa a viver em **`Componentes/Formulário/Field`**.

No mesmo movimento o componente é **renomeado no código** de `FormField` para **`Field`** (`packages/ui/src/molecules/Field/`, export `Field`/`FieldProps`). Como ele ainda não tinha consumidor, o rename é barato; mantém a invariante do repo de que o leaf do menu espelha o nome do componente, e o nome segue em inglês como os demais do DS. O `Input` base permanece em `Componentes/Inputs/Input/Input`.

Motivo: o `Field` estrutura um campo (label + erro + ajuda) em volta de um controle — é um conceito de formulário, não um controle de input. Mantê-lo junto dos controles em `Inputs/Input/*` (Adendo #1) misturava o wrapper com os controles que ele envolve.

Consequências:
- O array de ordem do `storySort` em `.storybook/preview.ts` volta a listar `'Formulário'` (após `'Inputs'`).
- A introdução (`.storybook/Introducao.mdx`) volta a descrever o wrapper (como `Field`) numa categoria própria.
- Código atômico preservado: `Field` segue como `molecule`; muda o nome do componente e o `title:` da story.
