/**
 * Valida DS_CATEGORICAL: separação ΔE ≥ 8, contraste útil em surface clara/escura,
 * e ausência de cores de status (success/warning/error).
 *
 * Exit 0 = PASS; exit 1 = FAIL.
 * Uso: pnpm validate:ds-palette
 */

import { colorPrimitives } from '../packages/ui/src/tokens/colors'

/** Manter sincronizado com packages/ui/src/charts/dsPalette.ts */
const DS_CATEGORICAL = [
  colorPrimitives.blue[500],
  colorPrimitives.blue[300],
  colorPrimitives.gray[600],
  colorPrimitives.blue[700],
  colorPrimitives.gray[400],
  colorPrimitives.blue[900],
  colorPrimitives.gray[900],
  colorPrimitives.blue[100],
] as const

const SURFACES = {
  light: colorPrimitives.white,
  dark: colorPrimitives.blue[900],
} as const

const MIN_DELTA_E = 8
/** Contraste mínimo série × surface (fills em gráfico, não texto AA). */
const MIN_CONTRAST = 1.25

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function relLuminance({ r, g, b }: Rgb): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relLuminance(a)
  const l2 = relLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function deltaE(a: Rgb, b: Rgb): number {
  const labA = rgbToLab(a)
  const labB = rgbToLab(b)
  return Math.sqrt(
    (labA.l - labB.l) ** 2 + (labA.a - labB.a) ** 2 + (labA.b - labB.b) ** 2,
  )
}

function rgbToLab({ r, g, b }: Rgb): { l: number; a: number; b: number } {
  let rr = r / 255
  let gg = g / 255
  let bb = b / 255
  rr = rr > 0.04045 ? ((rr + 0.055) / 1.055) ** 2.4 : rr / 12.92
  gg = gg > 0.04045 ? ((gg + 0.055) / 1.055) ** 2.4 : gg / 12.92
  bb = bb > 0.04045 ? ((bb + 0.055) / 1.055) ** 2.4 : bb / 12.92

  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047
  let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883

  x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116
  y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116
  z = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  }
}

const failures: string[] = []
const warnings: string[] = []

// ΔE entre pares
for (let i = 0; i < DS_CATEGORICAL.length; i += 1) {
  for (let j = i + 1; j < DS_CATEGORICAL.length; j += 1) {
    const a = DS_CATEGORICAL[i]!
    const b = DS_CATEGORICAL[j]!
    const d = deltaE(hexToRgb(a), hexToRgb(b))
    if (d < MIN_DELTA_E) {
      failures.push(`ΔE < ${MIN_DELTA_E} entre ${a} e ${b} (ΔE=${d.toFixed(2)})`)
    }
  }
}

// Contraste com surfaces light e dark (pelo menos uma surface com contraste ok)
for (const hex of DS_CATEGORICAL) {
  const rgb = hexToRgb(hex)
  const cLight = contrastRatio(rgb, hexToRgb(SURFACES.light))
  const cDark = contrastRatio(rgb, hexToRgb(SURFACES.dark))
  if (cLight < MIN_CONTRAST && cDark < MIN_CONTRAST) {
    failures.push(
      `Contraste insuficiente em light e dark: ${hex} (light=${cLight.toFixed(2)}, dark=${cDark.toFixed(2)})`,
    )
  } else if (cLight < MIN_CONTRAST) {
    warnings.push(`Contraste baixo em light (${cLight.toFixed(2)}): ${hex} — preferir em tema dark ou com borda`)
  } else if (cDark < MIN_CONTRAST) {
    warnings.push(`Contraste baixo em dark (${cDark.toFixed(2)}): ${hex}`)
  }
}

// Status fora da categórica
const statusHex = [
  colorPrimitives.green[500],
  colorPrimitives.red[500],
  colorPrimitives.yellow[500],
]
for (const s of statusHex) {
  if ((DS_CATEGORICAL as readonly string[]).includes(s)) {
    failures.push(`Cor de status ${s} não pode estar em DS_CATEGORICAL`)
  }
}

// Duplicatas
const unique = new Set(DS_CATEGORICAL)
if (unique.size !== DS_CATEGORICAL.length) {
  failures.push('DS_CATEGORICAL contém cores duplicadas')
}

console.log('DS_CATEGORICAL validation')
console.log('colors:', DS_CATEGORICAL.join(', '))
if (warnings.length) {
  console.log('\nWARN:')
  warnings.forEach((w) => console.log(' -', w))
}
if (failures.length) {
  console.log('\nFAIL:')
  failures.forEach((f) => console.log(' -', f))
  process.exit(1)
}

console.log('\nPASS — ΔE ≥ 8, status fora da categórica, contraste ok em light e/ou dark.')
process.exit(0)
