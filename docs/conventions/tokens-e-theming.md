# Convenção: Tokens e Theming

**Público:** todos (plataforma e squads operacionais).

Esta convenção explica **o que são os tokens do nosso Design System**, como consumi-los no código e as **melhores práticas** para manter a base livre de valores hardcodados. Complementa o [ADR-0008 (pipeline de tokens)](../adr/ADR-0008-token-pipeline.md), que registra a decisão de como os tokens são sincronizados a partir do Figma.

> **Regra de ouro:** se existe um token para o valor, use o token. Hex cru e tamanhos de fonte "na mão" não entram no código.

---

## 1. Por que tokens?

Um token é uma **decisão de design guardada em um lugar só** (a cor da marca, o tamanho de um título, o espaçamento padrão). Em vez de espalhar `#01258F` por dezenas de arquivos, referenciamos `interactive-default`. Se a marca mudar de azul, muda-se **um valor** e propaga para todo o sistema.

Fonte da verdade: **Figma** (`fileKey GPvf4G2qpP8MMyK3HB6n2t`). Os valores são sincronizados via `pnpm sync:tokens` para `packages/ui/src/tokens/*` e expostos ao Tailwind em `tailwind.config.ts`. **Não edite valores de token na mão sem sincronizar com o Figma.**

---

## 2. As duas camadas: primitivo vs. semântico

```
Primitivo  →  blue/500 = #01258F      (a paleta crua, "o que é")
Semântico  →  interactive-default      (a intenção, "para que serve")  →  componentes usam ISTO
```

- **Primitivos** (`colorPrimitives` em `tokens/colors.ts`): a paleta bruta. **Não devem ser usados direto pelos componentes.** Não são expostos ao Tailwind — *com uma exceção documentada* (ver §4).
- **Semânticos** (`colors` em `tokens/colors.ts`): a camada que descreve a *intenção*. É o que os componentes consomem (`bg-interactive-default`, `text-text-inverse`, `border-border-focus`...).

Por que separar? Porque a intenção é estável e o valor pode mudar. `text-brand` continua sendo "a cor da marca" mesmo que o azul exato troque.

---

## 3. As escalas disponíveis (e suas classes Tailwind)

### Cores — `tokens/colors.ts`
Quatro grupos semânticos. Use como `bg-*`, `text-*`, `border-*`.

| Grupo | Tokens | Exemplos de classe |
|---|---|---|
| `interactive` (brand) | default, hover, pressed, disabled, subtle, focus-ring | `bg-interactive-default`, `hover:bg-interactive-hover` |
| `interactive` (positive/negative) | `{positive,negative}-{default,hover,pressed,subtle,focus-ring}` | `bg-interactive-positive-default`, `text-interactive-negative-default` |
| `feedback` | success, error, warning, info | `bg-feedback-error`, `text-feedback-success` |
| `background` | default, surface, overlay | `bg-background-surface` |
| `text` | primary, secondary, disabled, placeholder, inverse, brand | `text-text-primary`, `text-text-inverse` |
| `border` | default, focus, error, disabled | `border-border-focus` |

### Tipografia — `tokens/typography.ts`
**Sempre via o átomo `<Text variant="...">`** — ele pareia tamanho + entrelinha + peso + família corretos. Não monte `text-* + font-*` na mão.

| Intenção | Variant | Tamanho |
|---|---|---|
| Títulos | `heading-h1`, `heading-h2` | 48 / 36px (Inter SemiBold) |
| Corpo | `body-md`, `body-sm` (+ `-emphasis`) | 20 / 16px (Afacad) |
| Labels | `label-xl`, `label-md`, `label-sm`, `label-xs` (+ `-emphasis`) | 32 / 16 / 14 / 12px (Inter) |

As classes `text-heading-h1`, `text-label-md` etc. existem (úteis para **overrides responsivos**, ver §5), mas o caminho normal é o `Text`.

### Espaçamento — `tokens/spacing.ts`
Escala curada (segue a convenção do Tailwind, valor px ÷ 4). Use em `p-*`, `m-*`, `gap-*`, `inset-*`:

| Token | px | Token | px |
|---|---|---|---|
| `1` | 4 | `10` | 40 |
| `2` | 8 | `14` | 56 |
| `3` | 12 | `18` | **72** |
| `4` | 16 | `20` | 80 |
| `6` | 24 | `24` | 96 |
| `8` | 32 | `30` | 120 |

> A escala é **intencionalmente esparsa** (não tem `5`, `7`, `11`, `12`...). Se você usar `mt-11`, o Tailwind cai no default dele (44px) e você **furou a escala do DS** sem perceber. Prefira o token mais próximo (`mt-10`/`mt-14`).

### Radius — `tokens/radius.ts`
`rounded-sm` (4px) · `rounded-md` (8px) · `rounded-lg` (12px) · `rounded-xl` (24px) · `rounded-full`.

> `rounded-xl` (24px) é o raio de marca de painéis/superfícies (ex.: o gradiente do `AuthLayout` usa `rounded-r-xl`, o painel de conteúdo do `AppLayout` usa `rounded-tl-xl`). Ele sobrescreve o `rounded-xl` default do Tailwind (0.75rem → 1.5rem).

### Border width — `tokens/border.ts`
`border-sm` etc., conforme a escala definida.

---

## 4. A regra dos primitivos (e a exceção do auth)

> Componentes usam **somente a camada semântica**. Primitivos não são expostos ao Tailwind.

A única exceção atual: o **fundo full-bleed das telas de autenticação** usa a paleta primitiva `blue` (`from-blue-300 to-blue-500`), porque é um gradiente de marca que não tem token semântico de "background de auth". Isso está **documentado** em `tailwind.config.ts` e `tokens/colors.ts`, e restrito a esse caso. Novas exceções só entram **com aprovação do Tech Lead**.

---

## 5. Melhores práticas

**✅ Faça**
- **Use o token quando ele existe.** `lg:px-18` (token de 72px) em vez de `lg:px-[72px]`.
- **Tipografia sempre via `<Text>`** — escolha a *intenção* (`variant`), não os pixels.
- **Responsivo com classes de token:** `variant="label-xl-emphasis"` + `className="lg:text-heading-h1"` troca só o tamanho entre breakpoints, ainda 100% via token.
- **Cores sempre semânticas:** `text-text-inverse`, `bg-feedback-error`, `border-border-focus`.

**🚫 Evite**
- **Hex cru** (`bg-[#01258F]`) — sempre há um token de cor. Zero exceções fora do §4.
- **Tamanho de fonte cru** (`text-[16px]`) — use `Text`/`label-md`.
- **Furar a escala de spacing** (`mt-11`, `mt-12`) — snap para o token do DS.

**🟡 Valores arbitrários (`[...px]`/`%`) — quando são aceitáveis**
Apenas para **medidas de layout que não são tokens**: larguras de coluna (`lg:w-[45.6%]`), largura máxima de um bloco (`max-w-[468px]`), offsets pontuais vindos do Figma. **Nunca** para cor, tipografia ou espaçamentos que já existem na escala. Quando um literal vira recorrente (ex: o raio de 24px), isso é sinal de que ele deveria virar um **novo token** — proposta ao DS, aprovada pelo TL.

---

## 6. Exemplos certo × errado (tirados do nosso próprio código)

```tsx
// ❌ token existe, mas usou literal
<div className="lg:px-[72px]" />
// ✅ usa o token de spacing (72px = spacing[18])
<div className="lg:px-18" />

// ❌ hex cru e tamanho na mão
<p className="text-[#FFFFFF] text-[48px] font-semibold">Bem vindo!</p>
// ✅ intenção via Text + tom semântico
<Text as="h1" variant="heading-h1" tone="inverse">Bem vindo!</Text>

// ❌ fura a escala (44px do default do Tailwind)
<div className="mt-11" />
// ✅ token do DS mais próximo
<div className="mt-10" />   {/* 40px */}

// 🟡 arbitrário aceitável — medida de layout sem token
<form className="max-w-[468px]" />
```

---

## 7. Checklist rápido de review

- [ ] Nenhum hex cru (`#...`) fora do gradiente de auth documentado.
- [ ] Nenhum `text-[Npx]` — tipografia via `Text`/tokens.
- [ ] Espaçamentos batem com a escala (`tokens/spacing.ts`) — sem `mt-11`/`mt-12` & cia.
- [ ] Valores `[...]` arbitrários são só medidas de layout (largura, %, offset), nunca cor/tipografia/spacing.
- [ ] Componentes consomem a camada **semântica**, não primitivos.
- [ ] Literal recorrente? → considerar promover a token (aprovação do TL).

---

## 8. Quando o token não existe (dívida de token)

O que fazer quando o token que você precisa não existe no design system. Nem todo valor arbitrário é dívida; a distinção é por categoria.

### 8.1 Literal aceitável vs. literal proibido

| Tipo de valor | Exemplo | Aceitável? |
|---|---|---|
| Medida de layout sem token (largura de coluna, offset de posição) | `max-w-[480px]`, `left-[3px]` | Sim |
| Cor fora da camada semântica | `bg-[#01258F]` | Não, use o token semântico |
| Tamanho de fonte fora da escala | `text-[14px]` | Não, use `Text` ou classe de token |
| Espaçamento fora da escala do DS | `mt-[44px]`, `mt-11` | Não, snap para o token mais próximo |
| Radius sem token definido | `rounded-[20px]` | Temporariamente sim, com dívida registrada (o 24px já tem token `xl`) |

### 8.2 Como documentar uma dívida

Quando usar um literal temporário por ausência de token, documente em dois lugares.

No código, comentário imediatamente acima:

```tsx
{/* DS não tem token de radius 24px - rounded-3xl até adição de radius.xl */}
<div className="rounded-r-[24px]" />
```

Na tabela de dívidas técnicas conhecidas do [`AGENTS.md`](../../AGENTS.md):

```markdown
| Descrição curta | `caminho/do/arquivo.tsx` | O que precisa ser feito |
```

### 8.3 Quando promover para token

Um literal temporário deve virar token quando:

- O mesmo valor aparece em dois ou mais lugares distintos no código.
- O valor representa uma decisão de design (não uma medida de layout pontual).
- O designer confirma que o valor é intencional e recorrente no DS.

Se apenas um lugar usa o valor, o literal com comentário é suficiente por ora.

### 8.4 Como propor um novo token

1. Abra uma issue descrevendo o valor, onde ele aparece e por que deveria ser token.
2. Alinhe com o Tech Lead; novos tokens mudam o contrato do DS.
3. Se aprovado, o designer atualiza o Figma DS (`fileKey GPvf4G2qpP8MMyK3HB6n2t`).
4. Rode `pnpm sync:tokens` após a exportação do plugin `variables2json` do Figma.
5. Revise a normalização em `scripts/sync-tokens.ts` se necessário.
6. Adicione ao `tailwind.config.ts` em `theme.extend` se o token pertencer a uma nova categoria.
7. Remova o literal temporário e o comentário de dívida.
8. Remova a entrada da tabela no `AGENTS.md`.

Ver [ADR-0008 (pipeline de tokens)](../adr/ADR-0008-token-pipeline.md).
