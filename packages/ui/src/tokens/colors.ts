/**
 * Tokens de cor do Portal Conecta.
 *
 * `colors` expõe somente a camada semântica — componentes nunca devem
 * referenciar `colorPrimitives` diretamente. A camada primitiva existe
 * como export separado para uso restrito (ex: paleta visual no Storybook).
 *
 * Valores sincronizados via `pnpm sync:tokens` (plugin variables2json).
 * Fonte: Figma DS fileKey GPvf4G2qpP8MMyK3HB6n2t, coleção semantic/colors.
 */

// ---------------------------------------------------------------------------
// Paleta primitiva — não usar em componentes, somente via camada semântica
// ---------------------------------------------------------------------------

export const colorPrimitives = {
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
  // Rampas verde/vermelho: o `500` vem do Figma; os demais shades (100/300/700/
  // 900) foram propostos para dar hover/pressed/focus/subtle aos tons positive e
  // negative do Button (#143). Pendente de backfill no Figma DS — aprovado pelo TL.
  green:  { 100: '#EAF3D6', 300: '#9FCB4D', 500: '#7EB61C', 700: '#689913', 900: '#4F730E' },
  red:    { 100: '#FBD2D2', 300: '#F46A6A', 500: '#ED1515', 700: '#C21111', 900: '#8F0C0C' },
  yellow: { 500: '#FFD600' },
  white:  '#FFFFFF',
} as const

export type ColorPrimitives = typeof colorPrimitives

// ---------------------------------------------------------------------------
// Camada semântica — o que os componentes usam
// ---------------------------------------------------------------------------

export const colors = {
  interactive: {
    // Tom `brand` (padrão) — mantém as chaves sem prefixo por retrocompat.
    default:      colorPrimitives.blue[500],
    hover:        colorPrimitives.blue[700],
    pressed:      colorPrimitives.blue[900],
    disabled:     colorPrimitives.gray[200],
    subtle:       colorPrimitives.blue[100],
    'focus-ring': colorPrimitives.blue[300],

    // Tom `positive` (verde) — usado pelo Button (#143).
    'positive-default':    colorPrimitives.green[500],
    'positive-hover':      colorPrimitives.green[700],
    'positive-pressed':    colorPrimitives.green[900],
    'positive-subtle':     colorPrimitives.green[100],
    'positive-focus-ring': colorPrimitives.green[300],

    // Tom `negative` (vermelho) — usado pelo Button (#143).
    'negative-default':    colorPrimitives.red[500],
    'negative-hover':      colorPrimitives.red[700],
    'negative-pressed':    colorPrimitives.red[900],
    'negative-subtle':     colorPrimitives.red[100],
    'negative-focus-ring': colorPrimitives.red[300],
  },
  feedback: {
    success: colorPrimitives.green[500],
    error:   colorPrimitives.red[500],
    warning: colorPrimitives.yellow[500],
    info:    colorPrimitives.blue[300],
  },
  background: {
    default: colorPrimitives.gray[50],
    surface: colorPrimitives.white,
    overlay: '#00000066',
  },
  text: {
    primary:     colorPrimitives.gray[900],
    secondary:   colorPrimitives.gray[600],
    disabled:    colorPrimitives.gray[400],
    placeholder: colorPrimitives.gray[400],
    inverse:     colorPrimitives.white,
    brand:       colorPrimitives.blue[500],
  },
  border: {
    default:  colorPrimitives.gray[200],
    focus:    colorPrimitives.blue[500],
    error:    colorPrimitives.red[500],
    disabled: colorPrimitives.gray[200],
  },
} as const

export type Colors = typeof colors
