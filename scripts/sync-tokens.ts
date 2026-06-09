/**
 * sync-tokens.ts
 *
 * Lê o arquivo `variables_from_figma.json` exportado pelo plugin variables2json,
 * valida, normaliza e imprime relatório das variáveis do Figma.
 * A escrita dos arquivos de token é feita manualmente após revisão do output.
 *
 * Uso: pnpm sync:tokens
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Tipos — espelham exatamente a estrutura do variables2json v1.x
// ---------------------------------------------------------------------------

type AliasValue = {
  collection: string
  name: string
}

type TypographyValue = {
  fontSize: number
  fontFamily: string
  fontWeight: string
  lineHeight: number
  lineHeightUnit: 'PERCENT' | 'PIXELS' | 'AUTO'
  letterSpacing: number
  letterSpacingUnit: 'PERCENT' | 'PIXELS'
  textCase: string
  textDecoration: string
}

type ColorVariableDirect = {
  name: string
  type: 'color'
  isAlias: false
  value: string // hex, ex: "#005B99" ou "#00000066"
}

type ColorVariableAlias = {
  name: string
  type: 'color'
  isAlias: true
  value: AliasValue
}

type NumberVariable = {
  name: string
  type: 'number'
  isAlias: false
  value: number
}

type TypographyVariable = {
  name: string
  type: 'typography'
  isAlias: false
  value: TypographyValue
}

type Variable =
  | ColorVariableDirect
  | ColorVariableAlias
  | NumberVariable
  | TypographyVariable

type Mode = {
  name: string
  variables: Variable[]
}

type Collection = {
  name: string
  modes: Mode[]
}

export type FigmaVariablesJson = {
  version: string
  metadata: Record<string, unknown>
  collections: Collection[]
}

// ---------------------------------------------------------------------------
// Nomes das coleções esperadas no JSON (contrato com o Figma DS)
// ---------------------------------------------------------------------------

const COLLECTION = {
  PRIMITIVES_COLORS: 'primitives/colors',
  SEMANTIC_COLORS: 'semantic/colors',
  SPACING: 'spacing',
  RADIUS: 'radius',
  BORDER: 'border',
  TYPOGRAPHY: 'Typography',
} as const

const DEFAULT_MODE = 'default'
/** Nome do mode da collection Typography no variables2json — difere das demais. */
const TYPOGRAPHY_MODE = 'Style'

// ---------------------------------------------------------------------------
// Leitura e validação do JSON
// ---------------------------------------------------------------------------

/**
 * Verifica se um valor é um objeto não-nulo (guard auxiliar).
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Valida a estrutura do JSON contra o contrato esperado do variables2json.
 * Lança um erro descritivo se qualquer campo obrigatório estiver ausente.
 */
function validateFigmaJson(raw: unknown): asserts raw is FigmaVariablesJson {
  if (!isObject(raw)) {
    throw new Error('JSON inválido: esperava um objeto na raiz.')
  }

  if (!Array.isArray(raw['collections'])) {
    throw new Error(
      'JSON inválido: campo "collections" ausente ou não é um array.',
    )
  }

  const expectedCollections = Object.values(COLLECTION)
  const foundCollections = (raw['collections'] as unknown[])
    .filter(isObject)
    .map((c) => c['name'])

  for (const expected of expectedCollections) {
    if (!foundCollections.includes(expected)) {
      throw new Error(
        `JSON inválido: coleção obrigatória "${expected}" não encontrada.\n` +
          `Coleções presentes: ${foundCollections.join(', ')}`,
      )
    }
  }

  for (const collection of raw['collections'] as unknown[]) {
    if (!isObject(collection)) {
      throw new Error('JSON inválido: item em "collections" não é um objeto.')
    }
    if (typeof collection['name'] !== 'string') {
      throw new Error('JSON inválido: coleção sem campo "name" (string).')
    }
    if (!Array.isArray(collection['modes'])) {
      throw new Error(
        `JSON inválido: coleção "${collection['name']}" sem campo "modes" (array).`,
      )
    }

    for (const mode of collection['modes'] as unknown[]) {
      if (!isObject(mode)) {
        throw new Error(
          `JSON inválido: mode inválido na coleção "${collection['name']}".`,
        )
      }
      if (!Array.isArray(mode['variables'])) {
        throw new Error(
          `JSON inválido: mode "${mode['name']}" sem campo "variables" (array).`,
        )
      }
    }
  }
}

/**
 * Lê e parseia o variables_from_figma.json da raiz do repositório.
 * Emite erros descritivos em caso de arquivo ausente, JSON malformado
 * ou estrutura divergente do esperado.
 */
function readFigmaJson(): FigmaVariablesJson {
  const jsonPath = resolve(process.cwd(), 'variables_from_figma.json')

  if (!existsSync(jsonPath)) {
    throw new Error(
      `Arquivo não encontrado: variables_from_figma.json\n` +
        `Caminho esperado: ${jsonPath}\n` +
        `Execute o plugin variables2json no Figma e salve o arquivo na raiz do repositório.`,
    )
  }

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err)
    throw new Error(`Falha ao ler/parsear variables_from_figma.json: ${cause}`)
  }

  validateFigmaJson(raw)
  return raw
}

// ---------------------------------------------------------------------------
// Helper de acesso a collections e modes
// ---------------------------------------------------------------------------

/**
 * Localiza uma collection por nome e retorna o mode pedido.
 * Inclui os modos presentes na mensagem de erro para facilitar diagnóstico
 * quando o plugin exportar com nomes diferentes do esperado.
 */
function getMode(figma: FigmaVariablesJson, collectionName: string, modeName: string): Mode {
  const collection = figma.collections.find((c) => c.name === collectionName)
  if (!collection) {
    throw new Error(`Coleção "${collectionName}" não encontrada.`)
  }
  const mode = collection.modes.find((m) => m.name === modeName)
  if (!mode) {
    throw new Error(
      `Mode "${modeName}" não encontrado em "${collectionName}".\n` +
      `Modos presentes: ${collection.modes.map((m) => m.name).join(', ')}`,
    )
  }
  return mode
}

// ---------------------------------------------------------------------------
// Mapa de primitivos e resolução de aliases
// ---------------------------------------------------------------------------

/** Lookup: "primitives/colors::blue/500" → "#01258F" */
type PrimitivesMap = Map<string, string>

/**
 * Chave composta usada para o mapa de primitivos.
 * Inclui o nome da coleção para suportar aliases entre coleções distintas.
 */
function primitiveKey(collection: string, name: string): string {
  return `${collection}::${name}`
}

/**
 * Constrói o mapa de todos os tokens primitivos de cor.
 * Apenas variáveis diretas (isAlias: false) são indexadas aqui.
 */
function buildPrimitivesMap(figma: FigmaVariablesJson): PrimitivesMap {
  const map: PrimitivesMap = new Map()
  const mode = getMode(figma, COLLECTION.PRIMITIVES_COLORS, DEFAULT_MODE)

  for (const variable of mode.variables) {
    if (variable.type === 'color' && !variable.isAlias) {
      map.set(primitiveKey(COLLECTION.PRIMITIVES_COLORS, variable.name), variable.value)
    }
  }

  return map
}

/**
 * Resultado da resolução de aliases semânticos.
 * Chave: nome do token semântico (ex: "interactive/default")
 * Valor: hex resolvido (ex: "#01258F")
 */
export type ResolvedSemanticColors = Map<string, string>

/**
 * Percorre a coleção semantic/colors no modo "default" e resolve cada alias
 * para seu valor hex primitivo. Lança erro se o alias apontar para um
 * primitivo inexistente no mapa.
 */
function resolveSemanticColors(
  figma: FigmaVariablesJson,
  primitivesMap: PrimitivesMap,
): ResolvedSemanticColors {
  const resolved: ResolvedSemanticColors = new Map()
  // Usa apenas o modo "default" — o modo "Mode" é duplicata acidental
  const mode = getMode(figma, COLLECTION.SEMANTIC_COLORS, DEFAULT_MODE)

  for (const variable of mode.variables) {
    if (variable.type !== 'color') continue

    if (!variable.isAlias) {
      // Valor direto (ex: background/overlay com rgba)
      resolved.set(variable.name, variable.value)
      continue
    }

    // Resolve o alias no mapa de primitivos
    const key = primitiveKey(variable.value.collection, variable.value.name)
    const hex = primitivesMap.get(key)

    if (hex === undefined) {
      throw new Error(
        `Alias não resolvido: "${variable.name}" aponta para ` +
          `"${variable.value.collection}::${variable.value.name}", ` +
          `que não existe no mapa de primitivos.`,
      )
    }

    resolved.set(variable.name, hex)
  }

  return resolved
}

// ---------------------------------------------------------------------------
// Normalizações e conversões
// ---------------------------------------------------------------------------

/**
 * Converte px para rem com 4 casas decimais máximas, sem trailing zeros.
 * Ex: 4 → "0.25rem" | 16 → "1rem" | 120 → "7.5rem"
 */
function pxToRem(px: number): string {
  const rem = px / 16
  return `${parseFloat(rem.toFixed(4))}rem`
}

/**
 * Normaliza fontWeight: aceita as variações do Figma ("Semi Bold", "SemiBold",
 * "Regular") e retorna o valor CSS numérico como string.
 */
function normalizeFontWeight(raw: string): string {
  const cleaned = raw.toLowerCase().replace(/\s/g, '')
  if (cleaned === 'semibold') return '600'
  if (cleaned === 'regular') return '400'
  // Fallback: tenta extrair um número caso o Figma adicione novos pesos
  const numeric = parseInt(cleaned, 10)
  if (!isNaN(numeric)) return String(numeric)
  throw new Error(
    `fontWeight desconhecido: "${raw}". Adicione o mapeamento em normalizeFontWeight().`,
  )
}

/**
 * Normaliza lineHeight de percentual Figma para decimal CSS.
 * Arredonda floats ruidosos antes de converter (ex: 139.9999... → 1.4).
 * lineHeightUnit PERCENT: 120 → 1.2 | 140 → 1.4
 * lineHeightUnit PIXELS: converte para rem (raro no DS atual).
 *
 * Guard explícito para value === 0: algumas versões do variables2json
 * exportam lineHeight AUTO como { value: 0, lineHeightUnit: 'PERCENT' }.
 * Sem o guard, Math.round(0)/100 = 0 → CSS line-height:0 → texto invisível.
 */
function normalizeLineHeight(value: number, unit: TypographyValue['lineHeightUnit']): string {
  if (value === 0) return 'normal'
  if (unit === 'PERCENT') {
    const rounded = Math.round(value)
    return String(parseFloat((rounded / 100).toFixed(4)))
  }
  if (unit === 'PIXELS') {
    return pxToRem(value)
  }
  return 'normal'
}

/** Token de espaçamento já convertido para rem. */
export type SpacingToken = { name: string; remValue: string }

/**
 * Extrai e converte os tokens de spacing de px para rem.
 */
function normalizeSpacing(figma: FigmaVariablesJson): SpacingToken[] {
  const mode = getMode(figma, COLLECTION.SPACING, DEFAULT_MODE)
  return mode.variables
    .filter((v): v is NumberVariable => v.type === 'number')
    .map((v) => ({ name: v.name, remValue: pxToRem(v.value) }))
}

/** Token de radius já convertido. */
export type RadiusToken = { name: string; value: string }

/**
 * Extrai e converte os tokens de radius.
 * "full" (9999px) permanece em px — usar rem seria semanticamente incorreto.
 * Os demais são convertidos para rem.
 */
function normalizeRadius(figma: FigmaVariablesJson): RadiusToken[] {
  const mode = getMode(figma, COLLECTION.RADIUS, DEFAULT_MODE)
  return mode.variables
    .filter((v): v is NumberVariable => v.type === 'number')
    .map((v) => ({
      name: v.name,
      value: v.name === 'full' ? `${v.value}px` : pxToRem(v.value),
    }))
}

/** Token de border width. */
export type BorderToken = { name: string; value: string }

/**
 * Extrai os tokens de border width.
 * Mantidos em px — bordas de 1px ou 2px não devem escalar com rem.
 */
function normalizeBorder(figma: FigmaVariablesJson): BorderToken[] {
  const mode = getMode(figma, COLLECTION.BORDER, DEFAULT_MODE)
  return mode.variables
    .filter((v): v is NumberVariable => v.type === 'number')
    .map((v) => ({ name: v.name, value: `${v.value}px` }))
}

/** Token de tipografia normalizado e desmembrado. */
export type TypographyToken = {
  name: string
  fontFamily: string
  fontSize: string           // rem
  fontWeight: string         // CSS numérico ("400" | "600")
  lineHeight: string         // decimal ("1.2" | "1.4" | "1.5")
  /** Peso embutido na tupla fontSize do Tailwind quando ≠ 400 (emphasis e headings). */
  embeddedFontWeight?: string
}

/**
 * Extrai e normaliza a coleção Typography:
 * - fontWeight: "Semi Bold"/"SemiBold" → "600", "Regular" → "400"
 * - lineHeight: percentual → decimal (120% → "1.2")
 * - fontSize: px → rem
 * - Correção: body/sm-emphasis usa Afacad (inconsistência no Figma)
 */
function normalizeTypography(figma: FigmaVariablesJson): TypographyToken[] {
  const mode = getMode(figma, COLLECTION.TYPOGRAPHY, TYPOGRAPHY_MODE)

  return mode.variables
    .filter((v): v is TypographyVariable => v.type === 'typography')
    .map((v) => {
      const raw = v.value

      // Workaround: body/* deve usar Afacad (body/sm-emphasis tem "Inter" no Figma por engano)
      const figmaFamily = raw.fontFamily
      const fontFamily  = v.name.startsWith('body/') ? 'Afacad' : figmaFamily

      if (v.name.startsWith('body/') && figmaFamily !== 'Afacad') {
        console.warn(
          `  ⚠ Override ativo: "${v.name}" tem fontFamily "${figmaFamily}" no Figma, ` +
          `forçado para "Afacad". Verifique se o Figma foi corrigido.`,
        )
      }

      const token: TypographyToken = {
        name:       v.name,
        fontFamily,
        fontSize:   pxToRem(raw.fontSize),
        fontWeight: normalizeFontWeight(raw.fontWeight),
        lineHeight: normalizeLineHeight(raw.lineHeight, raw.lineHeightUnit),
      }

      // Embute o peso na tupla fontSize do Tailwind sempre que != 400 (default).
      // Cobre tanto *-emphasis quanto os headings (SemiBold por definição no DS),
      // garantindo que text-heading-h1 / text-body-md-emphasis apliquem o peso
      // sem precisar de `font-semibold` adicional.
      if (token.fontWeight !== '400') token.embeddedFontWeight = token.fontWeight

      return token
    })
}

// ---------------------------------------------------------------------------
// Ponto de entrada
// ---------------------------------------------------------------------------

function main(): void {
  const figma = readFigmaJson()
  console.log(`\n✔ variables_from_figma.json lido com sucesso (v${figma.version})`)
  console.log(`  Coleções encontradas: ${figma.collections.map((c) => c.name).join(', ')}`)

  // --- Cores ---
  const primitivesMap = buildPrimitivesMap(figma)
  console.log(`\n✔ primitives/colors: ${primitivesMap.size} tokens indexados`)

  const semanticColors = resolveSemanticColors(figma, primitivesMap)
  console.log(`✔ semantic/colors: ${semanticColors.size} aliases resolvidos`)
  for (const [name, hex] of semanticColors) {
    console.log(`    ${name.padEnd(32)} → ${hex}`)
  }

  // --- Spacing ---
  const spacing = normalizeSpacing(figma)
  console.log(`\n✔ spacing: ${spacing.length} tokens (px → rem)`)
  for (const t of spacing) {
    console.log(`    ${t.name.padEnd(8)} → ${t.remValue}`)
  }

  // --- Radius ---
  const radius = normalizeRadius(figma)
  console.log(`\n✔ radius: ${radius.length} tokens`)
  for (const t of radius) {
    console.log(`    ${t.name.padEnd(8)} → ${t.value}`)
  }

  // --- Border ---
  const border = normalizeBorder(figma)
  console.log(`\n✔ border: ${border.length} tokens`)
  for (const t of border) {
    console.log(`    ${t.name.padEnd(8)} → ${t.value}`)
  }

  // --- Typography ---
  const typography = normalizeTypography(figma)
  console.log(`\n✔ typography: ${typography.length} estilos normalizados`)
  for (const t of typography) {
    console.log(
      `    ${t.name.padEnd(24)} ${t.fontSize.padEnd(8)} ${t.fontFamily.padEnd(8)} w${t.fontWeight} lh${t.lineHeight}${t.embeddedFontWeight ? ` [embed w${t.embeddedFontWeight}]` : ''}`,
    )
  }

  console.log('\n✅ Todos os tokens processados sem erros.\n')
}

main()
