/**
 * Tokens de espaçamento do Portal Conecta.
 *
 * Nomes seguem a escala do Tailwind (valor px ÷ 4), permitindo que os
 * tokens se integrem naturalmente com as classes utilitárias existentes.
 * Ex: spacing[4] = 1rem = p-4 no Tailwind.
 *
 * Valores em rem (base 16px) para respeitar o zoom de acessibilidade
 * configurado pelo usuário no browser.
 *
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção "spacing".
 */

export const spacing = {
  1:  '0.25rem', //  4px
  2:  '0.5rem',  //  8px
  3:  '0.75rem', // 12px
  4:  '1rem',    // 16px
  6:  '1.5rem',  // 24px
  7:  '1.75rem', // 28px
  8:  '2rem',    // 32px
  10: '2.5rem',  // 40px
  14: '3.5rem',  // 56px
  18: '4.5rem',  // 72px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  30: '7.5rem',  // 120px
} as const

export type Spacing = typeof spacing
