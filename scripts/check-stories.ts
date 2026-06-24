/**
 * check-stories.ts — reprova no CI componente do @portal/ui sem story irmã.
 * Torna mecânica a regra de creating-components.md §6 / ADR-0007.
 *
 * Uso: pnpm check:stories
 */

import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const LAYERS = ['atoms', 'molecules', 'organisms'] as const

const UI_SRC = resolve(process.cwd(), 'packages/ui/src')

export type Component = {
  layer: (typeof LAYERS)[number]
  name: string
  dir: string
}

// Cada componente vive em `<camada>/<Nome>/<Nome>.tsx`; a chave é o arquivo
// homônimo, então auxiliares (icons.ts, index.ts) ficam fora do escopo.
export function collectComponents(): Component[] {
  return LAYERS.flatMap((layer) => {
    const layerDir = resolve(UI_SRC, layer)
    if (!existsSync(layerDir)) return []

    return readdirSync(layerDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(resolve(layerDir, entry.name, `${entry.name}.tsx`)))
      .map((entry) => ({
        layer,
        name: entry.name,
        dir: `packages/ui/src/${layer}/${entry.name}`,
      }))
  })
}

export function hasStory(component: Component): boolean {
  const base = resolve(UI_SRC, component.layer, component.name, `${component.name}.stories`)
  return existsSync(`${base}.tsx`) || existsSync(`${base}.ts`)
}

function main(): void {
  const components = collectComponents()
  const missing = components.filter((c) => !hasStory(c))

  if (missing.length > 0) {
    const detalhes = missing
      .map((c) => `    ${c.dir}/${c.name}.tsx\n      falta: ${c.dir}/${c.name}.stories.tsx`)
      .join('\n\n')

    throw new Error(
      `${missing.length} componente(s) sem story ` +
        `(ver docs/conventions/creating-components.md):\n\n${detalhes}\n\n` +
        `Todo componente em atoms/molecules/organisms precisa de ao menos uma story.`,
    )
  }

  console.log(`\n✅ ${components.length} componentes verificados — todos têm story.\n`)
}

main()
