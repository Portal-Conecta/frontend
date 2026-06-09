import type { Meta, StoryObj } from '@storybook/react'

import { Logo } from './Logo'

const meta = {
  title: 'Atoms/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['full', 'mark'] },
    tone: { control: 'inline-radio', options: ['brand', 'inverse'] },
    size: { control: { type: 'range', min: 16, max: 120, step: 2 } },
    decorative: { control: 'boolean' },
  },
  args: {
    variant: 'full',
    tone: 'brand',
    size: 54,
  },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

/** Logo completa, tom de marca (azul) — uso em fundos claros. */
export const Full: Story = {}

/** Logo resumida (só o símbolo) — uso em espaços reduzidos / sidebar colapsada. */
export const Mark: Story = {
  args: { variant: 'mark' },
}

/** Tom `inverse` (branco) sobre o painel azul — é o uso da tela de Login. */
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

/** Escala de tamanhos do DS: 16 · 24 · 32 · 54 px. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {[16, 24, 32, 54].map((size) => (
        <Logo key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** As quatro combinações aprovadas: completa/resumida × claro/escuro. */
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
