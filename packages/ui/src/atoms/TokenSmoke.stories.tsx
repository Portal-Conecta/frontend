import type { Meta, StoryObj } from '@storybook/react'
import { TokenSmoke } from './TokenSmoke'

/**
 * Smoke test do pipeline de tokens Figma → Tailwind.
 *
 * Pré-requisito para renderização visual: configurar PostCSS +
 * globals.css com `@import "tailwindcss"` no Storybook.
 * Enquanto isso, a história confirma que o componente compila e
 * que todos os nomes de classe são strings TypeScript válidas.
 */
const meta: Meta<typeof TokenSmoke> = {
  title: 'Tokens/Smoke Test',
  component: TokenSmoke,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof TokenSmoke>

export const Default: Story = {}
