/**
 * test-runner.js — gate de acessibilidade no CI (#104).
 *
 * Roda o axe em cada story via @storybook/test-runner. Violações de impacto
 * critical/serious reprovam o pipeline; moderate/minor entram como aviso.
 * Política em docs/conventions/acessibilidade.md.
 *
 * CommonJS de propósito: o `test-storybook` carrega esta config via jest-runtime,
 * cujo require sandboxed não honra o esbuild-register do test-runner — um `.ts`
 * com import/export seria tratado como ESM e exigiria Node ≥24.9 (o job usa 22).
 * Em CJS carrega em qualquer Node. Tipos via JSDoc, sem custo de runtime.
 */
const { getStoryContext } = require('@storybook/test-runner')
const { injectAxe, configureAxe, getViolations } = require('axe-playwright')

const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)
    const a11y = storyContext.parameters?.a11y

    // Respeita `parameters.a11y.disable` definido por story.
    if (a11y?.disable) return

    // Só reconfigura o axe quando a story declara regras próprias.
    if (a11y?.config?.rules) {
      await configureAxe(page, { rules: a11y.config.rules })
    }

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

module.exports = config
