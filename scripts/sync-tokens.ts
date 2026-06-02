/**
 * sync-tokens.ts
 *
 * Lê o arquivo `variables_from_figma.json` exportado pelo plugin variables2json
 * e transforma as variáveis do Figma nos arquivos de token do projeto.
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
  } catch {
    throw new Error(
      'Falha ao parsear variables_from_figma.json: o arquivo não é um JSON válido.',
    )
  }

  validateFigmaJson(raw)
  return raw
}

// ---------------------------------------------------------------------------
// Ponto de entrada
// ---------------------------------------------------------------------------

function main(): void {
  const figma = readFigmaJson()
  console.log(`\n✔ variables_from_figma.json lido com sucesso (v${figma.version})`)
  console.log(`  Coleções encontradas: ${figma.collections.map((c) => c.name).join(', ')}\n`)
}

main()
