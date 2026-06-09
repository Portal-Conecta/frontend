/**
 * Tokens de tipografia do Portal Conecta.
 *
 * Desmembrado por propriedade para integração direta com o Tailwind:
 * - fontFamily → theme.extend.fontFamily
 * - fontSize   → theme.extend.fontSize  (lineHeight e fontWeight embutidos)
 * - fontWeight → theme.extend.fontWeight
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
  fontFamily: {
    inter:  ['Inter', 'sans-serif'],
    afacad: ['Afacad', 'sans-serif'],
  },

  fontSize: {
    // Headings — Inter SemiBold (peso embutido: headings são sempre 600 no DS)
    'heading-h1': ['3rem',    { lineHeight: '1.2',  fontWeight: '600' }], // 48px / 120% SemiBold
    'heading-h2': ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }], // 36px / 125% SemiBold

    // Body — Afacad
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
} as const

export type Typography = typeof typography
