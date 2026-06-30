/**
 * Tokens de border-radius do Portal Conecta.
 *
 * sm/md/lg em rem para escalar com a preferência de fonte do usuário.
 * full em px fixo — 9999px é uma convenção para "completamente arredondado"
 * e não faz sentido semântico convertê-lo para rem.
 *
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção "radius".
 */

export const radius = {
  sm:   '0.25rem', //  4px
  md:   '0.5rem',  //  8px
  lg:   '0.75rem', // 12px
  // Sobrescreve rounded-xl do Tailwind default (0.75rem → 1.5rem).
  // Raio de marca: painéis e superfícies de auth.
  xl:   '1.5rem',  // 24px
  full: '9999px',
} as const

export type Radius = typeof radius
