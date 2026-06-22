import type { Meta, StoryObj } from '@storybook/react'

import { Logo } from './Logo'

const meta = {
  title: 'Atoms/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['full', 'mark'],
      description: 'Versão da marca: `full` (símbolo + wordmark) ou `mark` (só símbolo). Default `full`.',
    },
    tone: {
      control: 'inline-radio',
      options: ['brand', 'inverse'],
      description: 'Tom de cor derivado de token: `brand` (azul) ou `inverse` (branco). Default `brand`.',
    },
    size: {
      control: { type: 'range', min: 16, max: 120, step: 2 },
      description: 'Altura em px (largura deriva da proporção). DS: 16 · 24 · 32 · 54. Default 54.',
    },
    title: {
      control: 'text',
      description: 'Nome acessível da marca. Default "Portal Conecta". Ignorado se `decorative`.',
    },
    decorative: {
      control: 'boolean',
      description: 'Quando a logo é puramente decorativa (oculta de leitores de tela).',
    },
  },
  args: {
    variant: 'full',
    tone: 'brand',
    size: 54,
  },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const Mark: Story = {
  args: { variant: 'mark' },
}
export const OnDarkPanel: Story = {
  args: { tone: 'inverse' },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center rounded-md bg-interactive-default p-8">
        <Story />
      </div>
    ),
  ],
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {[16, 24, 32, 54].map((size) => (
        <Logo key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const Matrix: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border-default">
      <div className="flex items-center justify-center bg-background-surface p-8">
        <Logo variant="full" tone="brand" size={40} />
      </div>
      <div className="flex items-center justify-center bg-interactive-default p-8">
        <Logo variant="full" tone="inverse" size={40} />
      </div>
      <div className="flex items-center justify-center bg-background-surface p-8">
        <Logo variant="mark" tone="brand" size={48} />
      </div>
      <div className="flex items-center justify-center bg-interactive-default p-8">
        <Logo variant="mark" tone="inverse" size={48} />
      </div>
    </div>
  ),
}
