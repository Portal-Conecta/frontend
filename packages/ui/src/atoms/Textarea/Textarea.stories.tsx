import type { Meta, StoryObj } from '@storybook/react'

import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Componentes/Inputs/Input/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'overlay'] },
    rows: { control: { type: 'number', min: 1 } },
  },
  args: {
    placeholder: 'Escreva aqui...',
    'aria-label': 'Comentário',
    tone: 'default',
    rows: 4,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ComErro: Story = {
  args: { error: 'Este campo é obrigatório' },
}

export const Desabilitado: Story = {
  args: { disabled: true, value: 'Conteúdo bloqueado' },
}

/** Tom `overlay` — sobre um painel azul, como nas telas de auth. */
export const Overlay: Story = {
  args: { tone: 'overlay' },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md bg-gradient-to-b from-blue-300 to-blue-500 p-6">
        <Story />
      </div>
    ),
  ],
}
