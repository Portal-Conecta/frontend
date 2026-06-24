/**
 * test-runner.ts — gate de acessibilidade no CI (#104).
 *
 * Roda o axe em cada story via @storybook/test-runner. Violações de impacto
 * critical/serious reprovam o pipeline; moderate/minor entram como aviso.
 * Política em docs/conventions/acessibilidade.md.
 */
import type { TestRunnerConfig } from '@storybook/test-runner'
import { getStoryContext } from '@storybook/test-runner'
import { injectAxe, configureAxe, getViolations } from 'axe-playwright'

const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)
    const a11y = storyContext.parameters?.a11y

    // Respeita `parameters.a11y.disable` definido por story.
    if (a11y?.disable) return

    await configureAxe(page, { rules: a11y?.config?.rules })

    const violations = await getViolations(page, '#storybook-root')

    const blocking = violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''))
    const warnings = violations.filter((v) => !BLOCKING_IMPACTS.has(v.impact ?? ''))

    for (const v of warnings) {
      console.warn(`a11y aviso [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nó)`)
    }

    if (blocking.length > 0) {
      const details = blocking
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} nó(s)`)
        .join('\n')
      throw new Error(
        `Acessibilidade reprovada em "${context.title} › ${context.name}":\n${details}`,
      )
    }
  },
}

export default config
