/**
 * Tokens de border-width do Portal Conecta.
 *
 * Mantidos em px — bordas de 1px e 2px são valores absolutos
 * intencionais que não devem escalar com a fonte do usuário.
 *
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção "border".
 */

export const borderWidth = {
  sm: '1px',
  md: '2px',
} as const

export type BorderWidth = typeof borderWidth
