import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

/**
 * Config única de testes do monorepo (rodada da raiz).
 *
 * - `root` fixado no diretório desta config: o `include` e o `tsconfig.base.json`
 *   resolvem igual venha o comando da raiz (`pnpm test`) ou de um pacote
 *   (`pnpm --filter @portal/core test`, cujo cwd é `packages/core`).
 * - `tsconfigPaths` lê os aliases `@portal/*` do `tsconfig.base.json`, então um
 *   teste pode importar `@portal/core/auth/authService` igual ao código de produção.
 * - `environment: 'node'`: esta primeira leva cobre só lógica (auth) — sem DOM,
 *   sem jsdom, sem Testing Library. Quando entrar teste de componente, adiciona-se
 *   o ambiente jsdom aqui.
 * - `include`: testes vivem em `packages/<pkg>/tests/`, fora de `src`, para não
 *   entrarem no build composto (`tsc --build`) nem no lint tipado de `src`.
 */
const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tsconfigPaths({ projects: [resolve(rootDir, 'tsconfig.base.json')] })],
  test: {
    root: rootDir,
    environment: 'node',
    include: ['packages/**/tests/**/*.{test,spec}.{ts,tsx}'],
  },
})
