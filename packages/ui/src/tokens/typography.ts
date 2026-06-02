/**
 * Tokens de tipografia do Portal Conecta.
 *
 * Desmembrado por propriedade para integração direta com o Tailwind:
 * - fontFamily → theme.extend.fontFamily
 * - fontSize   → theme.extend.fontSize  (lineHeight embutido por escala)
 * - fontWeight → theme.extend.fontWeight
 *
 * O lineHeight está embutido em cada entrada de fontSize no formato
 * [tamanho, { lineHeight }] — padrão recomendado pelo Tailwind. Isso
 * garante que `text-heading-h1` aplique tanto o tamanho quanto o
 * entrelinhamento correto com uma única classe.
 *
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção "Typography".
 */

export const typography = {
  fontFamily: {
    inter:  ['Inter', 'sans-serif'],
    afacad: ['Afacad', 'sans-serif'],
  },

  fontSize: {
    // Headings — Inter SemiBold
    'heading-h1': ['3rem',    { lineHeight: '1.2'  }], // 48px / 120%
    'heading-h2': ['2.25rem', { lineHeight: '1.25' }], // 36px / 125%

    // Body — Afacad
    'body-md':          ['1.25rem', { lineHeight: '1.5' }], // 20px / 150%
    'body-md-emphasis': ['1.25rem', { lineHeight: '1.5' }], // 20px / 150% SemiBold
    'body-sm':          ['1rem',    { lineHeight: '1.5' }], // 16px / 150%
    'body-sm-emphasis': ['1rem',    { lineHeight: '1.5' }], // 16px / 150% SemiBold

    // Labels — Inter
    'label-xl':         ['2rem',     { lineHeight: '1.5' }], // 32px / 150%
    'label-xl-emphasis':['2rem',     { lineHeight: '1.5' }], // 32px / 150% SemiBold
    'label-md':         ['1rem',     { lineHeight: '1.4' }], // 16px / 140%
    'label-md-emphasis':['1rem',     { lineHeight: '1.4' }], // 16px / 140% SemiBold
    'label-sm':         ['0.875rem', { lineHeight: '1.4' }], // 14px / 140%
    'label-sm-emphasis':['0.875rem', { lineHeight: '1.4' }], // 14px / 140% SemiBold
    'label-xs':         ['0.75rem',  { lineHeight: '1.4' }], // 12px / 140%
  },

  fontWeight: {
    regular:  '400',
    semibold: '600',
  },
} as const

export type Typography = typeof typography
