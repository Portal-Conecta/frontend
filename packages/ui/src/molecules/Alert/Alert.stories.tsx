import type { Meta, StoryObj } from '@storybook/react'

import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Componentes/Feedback/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['error', 'info'],
      description:
        'Tipo da mensagem: `error` (barra vermelha, role `alert`) ou `info` (barra branca, role `status`). Default `error`.',
    },
  },
  args: {
    variant: 'error',
    children: 'Tente novamente com credenciais válidas.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md bg-interactive-default p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Alert>

export const ErrorAlert: Story = {}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Sua conta é gerenciada por um administrador. Para alterar sua senha, procure pela secretária SENAI.',
  },
}
