/**
 * sync-tokens.ts
 *
 * Lê o arquivo `variables_from_figma.json` exportado pelo plugin variables2json
 * e transforma as variáveis do Figma nos arquivos de token do projeto.
 *
 * Uso: pnpm sync:tokens
 */

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

// ---------------------------------------------------------------------------
// Ponto de entrada
// ---------------------------------------------------------------------------

function main(): void {
  // Implementado na task #4
}

main()
