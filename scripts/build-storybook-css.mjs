/**
 * Pré-compila o Tailwind CSS para o Storybook.
 *
 * Por quê: a integração Tailwind v4 + postcss-loader do Storybook (webpack via
 * @storybook/nextjs) não aplica o postcss.config de forma confiável, deixando
 * `@import "tailwindcss"` sem processar. Em vez de depender desse pipeline,
 * geramos um CSS final estático (`.storybook/tailwind.generated.css`) que o
 * Storybook importa como CSS comum.
 *
 * Lê `.storybook/tailwind.css` (que importa o Tailwind e referencia o
 * tailwind.config.ts com os design tokens) e escaneia o `content` configurado.
 * Rode sempre que novas classes utilitárias forem usadas nas stories — os
 * scripts `storybook` / `build-storybook` já chamam este passo antes.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = resolve(root, '.storybook/tailwind.css')
const output = resolve(root, '.storybook/tailwind.generated.css')

const css = readFileSync(input, 'utf8')

const result = await postcss([tailwindcss()]).process(css, { from: input, to: output })

writeFileSync(output, result.css)
console.log(`✓ Tailwind CSS gerado: ${output} (${result.css.length} bytes)`)
