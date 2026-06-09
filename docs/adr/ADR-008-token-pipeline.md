# ADR-008: Pipeline de Tokens — Figma Variables → TypeScript

## Status
Aceita

## Contexto

O pacote `@portal/ui` foi scaffoldado com arquivos de token vazios em
`packages/ui/src/tokens/`. As variáveis do Design System vivem no Figma
(arquivo *Portal Conecta - Design System*, fileKey `GPvf4G2qpP8MMyK3HB6n2t`)
e precisavam ser trazidas para o código de forma reproduzível e rastreável.

A ADR-006 já havia decidido que o Tailwind CSS seria alimentado por tokens
TypeScript via `theme.extend`. Esta ADR documenta como esses tokens são
gerados e quais decisões foram tomadas no processo.

## Decisão

Adotamos um **pipeline manual por sprint** baseado em três etapas:

```
Figma (plugin variables2json)
  → variables_from_figma.json  (raiz do repo)
  → pnpm sync:tokens           (scripts/sync-tokens.ts)
  → packages/ui/src/tokens/   (arquivos TypeScript)
  → tailwind.config.ts         (theme.extend)
```

### Estrutura de arquivos de token

```
packages/ui/src/tokens/
├── colors.ts      ← colors (semântico) + colorPrimitives (export separado)
├── spacing.ts     ← 12 valores de espaçamento em rem
├── typography.ts  ← fontFamily, fontSize (com lineHeight), fontWeight
├── radius.ts      ← 4 valores de border-radius
├── border.ts      ← 2 valores de border-width
└── index.ts       ← barrel export
```

### Decisões técnicas específicas

**Formato TypeScript `as const`**
Os arquivos de token exportam objetos `as const`, garantindo que o
TypeScript infira tipos literais (ex: `'#01258F'`, não `string`). Isso
ativa autocomplete e type-checking nos consumidores dos tokens.

**Somente camada semântica exposta**
O export principal de `colors.ts` contém apenas tokens semânticos
(`interactive`, `feedback`, `background`, `text`, `border`). A paleta
primitiva é exportada separadamente como `colorPrimitives` — disponível
para referência interna (ex: paleta visual no Storybook), mas não deve
ser usada diretamente em componentes. Isso permite que o design evolua
sem precisar atualizar referências espalhadas pelo código.

**Normalização de `fontWeight`**
O Figma exporta `"Semi Bold"` e `"SemiBold"` de forma inconsistente.
O script `sync-tokens.ts` normaliza ambos para `"600"` (valor CSS
numérico), evitando inconsistências no estilo renderizado.

**Normalização de `lineHeight`**
O Figma exporta `lineHeight` como percentual com ruído de ponto flutuante
(ex: `139.9999976158142`). O script arredonda e converte para decimal CSS:
- `h1`: 120% → `1.2`
- `h2`: 125% → `1.25`
- `body/*` e `label/xl*`: 150% → `1.5`
- `label/md` e menores: 140% → `1.4`

O `lineHeight` é embutido diretamente em cada entrada de `fontSize` no
formato `[tamanho, { lineHeight, fontWeight? }]`, padrão recomendado pelo
Tailwind. Tokens com peso ≠ 400 — `*-emphasis` e os **headings** (SemiBold por
definição no DS, sem variante Regular) — incluem `fontWeight: '600'` no objeto,
de modo que uma única classe (`text-heading-h1`, `text-body-md-emphasis`)
aplique tamanho, entrelinhamento e peso sem necessidade de `font-semibold`
adicional. O `sync-tokens.ts` embute o peso sempre que ele difere do default
400 (não apenas nos `*-emphasis`).

**Spacing em rem (base 16px)**
Todos os valores de espaçamento são convertidos de `px` para `rem`
dividindo por 16. `rem` respeita o zoom de acessibilidade configurado pelo
usuário no browser — `16px` fixo não escala, `1rem` sim.

Os nomes seguem a escala do Tailwind (`px ÷ 4`): `4px → 1`, `16px → 4`,
`32px → 8`. Isso mantém coerência com as classes utilitárias padrão.

**`border-width` em `px`**
Bordas de `1px` e `2px` são valores absolutos intencionais. Convertê-los
para `rem` criaria bordas que engrossam com o zoom, o que não é o
comportamento esperado.

**`border-radius/full` em `px` fixo**
O token `full: 9999px` é uma convenção semântica para "completamente
arredondado". Convertê-lo para rem (`624.9375rem`) seria tecnicamente
equivalente mas semanticamente confuso.

**Somente modo `"default"` do Figma**
A coleção `semantic/colors` tem dois modos: `"default"` e `"Mode"`. O
segundo é uma duplicata acidental deixada pelo designer. O script filtra
explicitamente apenas o modo `"default"`. Dark mode está fora do escopo do
projeto.

**Pipeline manual por sprint**
A exportação das variáveis do Figma é feita manualmente via plugin
[variables2json](https://www.figma.com/community/plugin/1253571037276959291)
a cada sprint, quando o designer atualizar o DS. O script `pnpm sync:tokens`
valida e transforma o JSON mas não sobrescreve os arquivos automaticamente —
a escrita ainda é feita manualmente para permitir revisão antes do commit.

## Alternativas consideradas

**Style Dictionary (Amazon)**
Ferramenta open source que lê JSON de tokens e gera código em múltiplos
formatos (CSS, SCSS, Swift, Kotlin, etc.). Descartada porque o projeto tem
um único formato de saída (TypeScript) e não há necessidade de suporte a
múltiplas plataformas por ora. Adicionaria complexidade de build sem
benefício proporcional.

**Tokens Studio (plugin Figma)**
Solução mais completa — sincroniza tokens diretamente com GitHub,
suporta múltiplos temas e mais de 20 tipos de token. Descartada pelo
custo (plano pago para funcionalidades relevantes) e pela curva de
aprendizado. O time não tem um designer de DS dedicado que justifique
o investimento.

**CSS Custom Properties**
Tokens como variáveis CSS nativas (`--color-interactive-default: #01258F`).
A principal vantagem é suporte nativo a troca de tema em runtime (dark mode,
multi-brand). Descartada porque o projeto não tem dark mode e o Tailwind v4
com `as const` já entrega type-safety sem necessidade de runtime JS.

**Automação via REST API do Figma**
Chamar `GET /v1/files/:fileKey/variables/local` em CI/CD para sincronizar
tokens automaticamente. Descartada por ora: requer gerenciamento de
`FIGMA_TOKEN` como segredo de CI e adiciona dependência de rede no pipeline.
Pode ser adotado no futuro se a frequência de atualizações aumentar.

## Consequências

**Positivo:**
- Tokens type-safe com autocomplete em todo o monorepo.
- Zero runtime JavaScript para estilos — compatível com React Server
  Components (alinhado com ADR-006).
- Camada semântica desacopla componentes da paleta primitiva — mudar
  `blue/500` no Figma reflete em todos os componentes sem busca-e-substituição.
- Script `sync-tokens.ts` valida a estrutura do JSON e emite erros
  descritivos, evitando tokens silenciosamente corrompidos.
- Processo explícito e rastreável via commits atômicos.

**Negativo:**
- Sincronização é manual — se o designer atualizar o DS e ninguém rodar
  `pnpm sync:tokens`, os tokens ficam desatualizados silenciosamente.
- A correção de `body/sm-emphasis` (fontFamily: Inter → Afacad) está
  hardcoded no script. Se o Figma for corrigido, o workaround deve ser
  removido.
- CSS do Storybook (PostCSS + `globals.css`) ainda não está configurado —
  validação visual dos tokens depende dessa infraestrutura ser adicionada
  quando o primeiro componente real for implementado.

## Referências

- ADR-006: Tailwind CSS v4 como Solução de Estilização
- `scripts/sync-tokens.ts` — script de validação, normalização e relatório
- `variables_from_figma.json` — snapshot das variáveis (atualizado a cada sprint)
- Figma DS: `https://figma.com/design/GPvf4G2qpP8MMyK3HB6n2t`
- Issue #32: Script sync-tokens.ts
- Issue #33: Populando os arquivos de token
