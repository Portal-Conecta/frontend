/**
 * Tokens de cor do Portal Conecta.
 *
 * Somente a camada semântica é exposta no export principal — componentes
 * nunca devem referenciar `primitives` diretamente.
 *
 * Valores sincronizados via `pnpm sync:tokens` (plugin variables2json).
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção semantic/colors.
 */

// ---------------------------------------------------------------------------
// Paleta primitiva — uso interno, não exportada diretamente
// ---------------------------------------------------------------------------

const primitives = {
  blue: {
    100: '#D6E0F7',
    300: '#0035D4',
    500: '#01258F',
    700: '#011E72',
    900: '#011142',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#D9D9D9',
    400: '#AAAAAA',
    600: '#777777',
    900: '#000000',
  },
  green: { 500: '#7EB61C' },
  red:   { 500: '#ED1515' },
  yellow:{ 500: '#FFD600' },
  white: '#FFFFFF',
} as const

// ---------------------------------------------------------------------------
// Camada semântica — o que os componentes usam
// ---------------------------------------------------------------------------

export const colors = {
  interactive: {
    default:     primitives.blue[500],
    hover:       primitives.blue[700],
    pressed:     primitives.blue[900],
    disabled:    primitives.gray[200],
    'focus-ring': primitives.blue[300],
  },
  feedback: {
    success: primitives.green[500],
    error:   primitives.red[500],
    warning: primitives.yellow[500],
    info:    primitives.blue[300],
  },
  background: {
    default: primitives.gray[50],
    surface: primitives.white,
    overlay: '#00000066',
  },
  text: {
    primary:     primitives.gray[900],
    secondary:   primitives.gray[600],
    disabled:    primitives.gray[400],
    placeholder: primitives.gray[400],
    inverse:     primitives.white,
    brand:       primitives.blue[500],
  },
  border: {
    default:  primitives.gray[200],
    focus:    primitives.blue[500],
    error:    primitives.red[500],
    disabled: primitives.gray[200],
  },

  // Paleta exposta apenas para referência visual (ex: Storybook)
  // Componentes devem sempre usar a camada semântica acima.
  primitives,
} as const

export type Colors = typeof colors
