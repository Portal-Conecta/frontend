/**
 * Tokens de tipografia do Portal Conecta.
 *
 * Desmembrado por propriedade para integração direta com o Tailwind:
 * - fontFamily    → theme.extend.fontFamily
 * - fontSize      → theme.extend.fontSize  (lineHeight e fontWeight embutidos)
 * - fontWeight    → theme.extend.fontWeight
 * - letterSpacing → theme.extend.letterSpacing (classe `tracking-*`)
 *
 * Tokens de tamanho seguem o formato [tamanho, { lineHeight, fontWeight? }].
 * Tokens com peso ≠ 400 — *-emphasis e os headings (SemiBold por definição no
 * DS) — incluem fontWeight: '600', então `text-heading-h1` / `text-body-md-emphasis`
 * aplicam tamanho, entrelinhamento e peso com uma única classe, sem precisar
 * adicionar `font-semibold` manualmente.
 *
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção "Typography".
 */

export const typography = {
  // As famílias vêm de CSS vars injetadas pelo next/font/google (modo variable):
  // --font-inter / --font-afacad são definidas no <html> do RootLayout
  // (apps/root) em runtime e replicadas no iframe do canvas pelo decorator do
  // Storybook em dev. Editado à mão (aprovação TL, #407); scripts/sync-tokens.ts
  // só lê o Figma e loga — não reescreve este arquivo.
  fontFamily: {
    inter:  ['var(--font-inter)', 'sans-serif'],
    afacad: ['var(--font-afacad)', 'sans-serif'],
  },

  fontSize: {
    // Display — números gigantes das páginas de erro (404/403/500). Escala
    // responsiva aplicada por breakpoint no consumidor (text-display-sm →
    // sm:text-display-md → md:text-display-lg → lg:text-display-xl). lineHeight 1
    // (número isolado, sem entrelinha). Pareia com o letterSpacing `display`.
    'display-sm': ['5rem',  { lineHeight: '1' }], //  80px
    'display-md': ['7rem',  { lineHeight: '1' }], // 112px
    'display-lg': ['10rem', { lineHeight: '1' }], // 160px
    'display-xl': ['15rem', { lineHeight: '1' }], // 240px

    // Headings — Inter SemiBold (peso embutido: headings são sempre 600 no DS).
    // Tamanho e lineHeight seguem a escala Headline do Material Design 3
    // (Large/Medium/Small) — promovido no código (aprovação TL, issue #328),
    // ainda não refletido na coleção Typography do Figma DS (ver AGENTS.md §
    // Dívidas técnicas).
    'heading-h1': ['2rem',    { lineHeight: '1.25', fontWeight: '600' }], // 32px / 125% SemiBold (MD3 Headline Large)
    'heading-h2': ['1.75rem', { lineHeight: '1.29', fontWeight: '600' }], // 28px / 129% SemiBold (MD3 Headline Medium)
    'heading-h3': ['1.5rem',  { lineHeight: '1.33', fontWeight: '600' }], // 24px / 133% SemiBold (MD3 Headline Small)

    // Body — Afacad
    'body-xl':          ['1.5rem',  { lineHeight: '1.5' }],                    // 24px / 150% Regular
    'body-xl-emphasis': ['1.5rem',  { lineHeight: '1.5', fontWeight: '600' }], // 24px / 150% SemiBold
    'body-md':          ['1.25rem', { lineHeight: '1.5' }],                    // 20px / 150% Regular
    'body-md-emphasis': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }], // 20px / 150% SemiBold
    'body-sm':          ['1rem',    { lineHeight: '1.5' }],                    // 16px / 150% Regular
    'body-sm-emphasis': ['1rem',    { lineHeight: '1.5', fontWeight: '600' }], // 16px / 150% SemiBold

    // Labels — Inter
    'label-xl':          ['2rem',     { lineHeight: '1.5' }],                    // 32px / 150% Regular
    'label-xl-emphasis': ['2rem',     { lineHeight: '1.5', fontWeight: '600' }], // 32px / 150% SemiBold
    'label-md':          ['1rem',     { lineHeight: '1.4' }],                    // 16px / 140% Regular
    'label-md-emphasis': ['1rem',     { lineHeight: '1.4', fontWeight: '600' }], // 16px / 140% SemiBold
    'label-sm':          ['0.875rem', { lineHeight: '1.4' }],                    // 14px / 140% Regular
    'label-sm-emphasis': ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }], // 14px / 140% SemiBold
    'label-xs':         ['0.75rem',  { lineHeight: '1.4' }],                    // 12px / 140% Regular
  },

  fontWeight: {
    regular:  '400',
    semibold: '600',
  },

  // letterSpacing → theme.extend.letterSpacing (classe `tracking-*`).
  // `display`: espaçamento largo do número das páginas de erro (tracking-display).
  letterSpacing: {
    display: '0.6em',
  },
} as const

export type Typography = typeof typography
