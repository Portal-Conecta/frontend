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

## Adendo 2026-07-07

A **SearchBar** ganha **subgrupo próprio `Componentes/Inputs/SearchBar/*`**, seguindo o mesmo critério do Select (Adendo #2): é uma **família** (controle base + `SearchBarAsync`), não um controle simples. Diferente do Select (que filtra opções de texto), a SearchBar mostra uma **lista de resultados ricos** (código + label) buscados sob demanda.

Estrutura:

```
Componentes/Inputs/SearchBar/SearchBar        → controle base (controlado por `items`; dois modos via `clearOnSelect`)
Componentes/Inputs/SearchBar/SearchBarAsync   → variante com busca no back (debounce + descarte de resposta obsoleta)
```

Consequências:
- No código, `SearchBar` é uma `molecule` (`packages/ui/src/molecules/SearchBar/`) por compor uma lista própria. A lista interna (`SearchBarResults`) **não** tem story — espelha o `SelectList`, que também é interno à família.
- A mecânica de combobox é compartilhada com o Select via o hook `packages/ui/src/hooks/useCombobox.ts` (não é um componente; sem story).
- Não há mudança no `storySort`: o subgrupo aninha sob `Inputs`, cuja ordem já está fixada.

## Adendo 2026-07-09

O **FileUpload** (#250) entra no vocabulário fechado como leaf direta em `Componentes/Inputs/FileUpload` — mesmo critério dos controles simples (`Checkbox`, `Radio`, `Textarea`), sem subgrupo próprio, já que hoje não há variantes irmãs (diferente do `Select`/`SearchBar`).

Estrutura:

```
Componentes/Inputs/FileUpload   → anexo de arquivo (só imagens por ora; accept/maxSize por prop)
```

Consequências:
- No código, `FileUpload` é uma `molecule` (`packages/ui/src/molecules/FileUpload/`) por compor os átomos `Icon` e `Text`.
- Promovido a partir do `ImageUploader` que existia em `packages/comunicados` (ciclo de promoção do AGENTS.md — nasce no domínio, migra pro DS); o consumidor (`AnnouncementContentStep`) passou a importar de `@portal/ui`.
- Não há mudança no `storySort`: a leaf aninha sob `Inputs`, cuja ordem já está fixada.

## Adendo 2026-07-20 — revisão geral de classificação (#436)

Revisão das seções feita na #436, usando o Storybook do **WEG DS** (design-system.weg.net) como validação externa. A referência confirmou três escolhas que já tínhamos — categoria própria para o wrapper de campo mesmo com um único membro (a WEG tem `Form` com Field/Fieldset/Form), navegação reunindo shell e navegação de conteúdo (a WEG junta Topbar, Sidebar, Pagination e Breadcrumb) e `Overlay` reunindo Toast e diálogos — e apontou os ajustes abaixo.

**1. O vocabulário de categorias passa a ser em inglês.** Até aqui ele misturava os dois idiomas (`Inputs`, `Feedback`, `Data`, `Overlay` e `Layout` contra `Ações`, `Formulário`, `Navegação` e `Conteúdo`). A mistura não é cosmética: é a causa provável do desvio corrigido no item 5, em que uma story traduziu `Overlay` para `Sobreposição` e criou uma categoria que nunca existiu. Um idioma só remove a ambiguidade, e alinha com a WEG, cujo vocabulário é todo em inglês.

Vocabulário fechado, agora completo e autoritativo — esta lista **substitui** a da seção Decisão:

```
Componentes/Actions      → Button, ShiftFilter
Componentes/Inputs       → Input/* · Pickers/* · Select/* · SearchBar/* · RichTextEditor · FileUpload · CourseSearchField
Componentes/Form         → Field
Componentes/Feedback     → Alert, Banner, EmptyState, ErrorPage, Skeleton
Componentes/Data         → Tag, ListItem, NotificationListItem, ClassCard, CourseRow
Componentes/Overlay      → Toast, DefaultModal, ConfirmDialog
Componentes/Navigation   → Sidebar/* · Section/* · AppHeader · AppFooter · Pagination
Componentes/Content      → Text, Icon, Logo, Avatar
Componentes/Layout       → AppLayout
```

A **raiz `Componentes` segue em português**, por decisão explícita: traduzi-la atingiria as quatro stories que moram em `packages/core` (ver consequências).

**2. Novo subgrupo `Componentes/Inputs/Pickers/*`.** `DateInput` e `TimeInput` saem de `Input/*` — que reúne controles de texto e seleção simples — e passam a `Inputs/Pickers/DateInput` e `Inputs/Pickers/TimeInput`. Espelha o `Inputs/Pickers` da WEG e restaura a invariante do Adendo #3 (o leaf espelha o nome do componente), que os leaves `Date`/`Time` violavam.

**3. `ClassCard` movido de `Conteúdo` para `Data`.** Ele exibe os dados de uma turma — é registro, não primitivo de apresentação.

**4. `RichTextEditor` vira leaf direta em `Componentes/Inputs/RichTextEditor`.** Estava em `Input/*`, que reúne `atoms` planos sobre `<input>`/`<textarea>` nativos; o RichTextEditor é um `organism` TipTap com toolbar. Segue o critério do FileUpload no Adendo 2026-07-09: leaf direta quando não há variantes irmãs.

**5. `ConfirmDialog` corrigido de `Componentes/Sobreposição/ConfirmDialog` para `Componentes/Overlay/ConfirmDialog`.** `Sobreposição` nunca existiu no vocabulário fechado nem no `storySort`, então a story ordenava como órfã no menu.

**6. Novo subgrupo `Componentes/Navigation/Sidebar/*`.** `Sidebar` e `SidebarNavItem` são a mesma relação pai/filho que `Section` e `SectionItem`, que já era subgrupo. Passam a `Navigation/Sidebar/Sidebar` e `Navigation/Sidebar/SidebarNavItem`.

**7. Critério escrito para a fronteira `Content` × `Data`**, que faltava e era a origem das dúvidas de classificação:

> **`Content`** reúne primitivos de apresentação sem dados de domínio: `Text`, `Icon`, `Logo`, `Avatar`.
> **`Data`** reúne componentes que **exibem** registros ou dados estruturados: `Tag`, `ListItem`, `NotificationListItem`, `ClassCard`, `CourseRow`.
> Controle que **captura** dado é `Inputs`, ainda que o dado seja um arquivo — é o que separa o `FileUpload` de `Data`.

O `FileUpload` chegou a ser movido para `Data` nesta revisão, por espelhar a WEG, e o movimento foi **revertido**: o `Data` da WEG tem outro caráter (DualList, TreeView, SimpleTable são widgets de manipulação de coleção), enquanto o nosso é só de exibição. O **Adendo 2026-07-09 segue válido e não é superado**.

**Renomear `Data` para `Dados` foi considerado e descartado.** Em português `Data` lê como *date*, e há um `DateInput` no DS ao lado — mas com o vocabulário em inglês o nome já está correto e a colisão não existe. A tentativa expôs uma lição que vale para qualquer mudança futura de vocabulário: **renomear um nó do menu não é confinável a um pacote quando o nó tem membros em outro.** A categoria tinha o `CourseRow` em `packages/core`, e renomeá-la só em `packages/ui` teria partido o menu em duas categorias, uma delas fora do `storySort`.

Consequências:
- O array de ordem do `storySort` passa a `['Actions', 'Inputs', 'Form', 'Feedback', 'Data', 'Overlay', 'Navigation', 'Content', 'Layout']`. Nenhuma categoria entra ou sai — `Pickers` e `Sidebar` são subgrupos que aninham sob categorias já ordenadas.
- 19 URLs de story mudam; custo já aceito na seção Consequências desta ADR.
- **`Actions` custou uma linha em `packages/core`**: o `ShiftFilter` mora lá e precisava acompanhar a categoria, pelo mesmo motivo da lição acima. É a única pegada da revisão fora de `packages/ui`. As outras três stories de `core` sob `Componentes/*` (`AppLayout`, `CourseRow`, `CourseSearchField`) ficaram em categorias que já estavam em inglês e não foram tocadas.
- Código atômico preservado: nenhum componente muda de pasta ou de camada, só o `title:`.
- Fora de escopo desta revisão, registrado para issues próprias: a seção `Fundação` está declarada no `storySort` mas vazia (as páginas de tokens e guidelines são a [#110](https://github.com/Portal-Conecta/frontend/issues/110)); o padrão da WEG de abrir cada categoria com `Get Started` + `Changelog`; uma seção `Core` para hooks e providers (`useCombobox`, `useFocusTrap`), que a WEG tem como `Core Components`; e a raiz `Componentes`, que segue em português.
- `Content` é hoje definida por negação — "primitivos que não são dados". É a categoria mais fraca do vocabulário; a WEG separa em `Typography`, `Icons` e `Media`, o que com quatro componentes daria três categorias de um a dois membros. Agregar é o certo por ora, mas é a primeira a revisitar conforme o DS cresce.
