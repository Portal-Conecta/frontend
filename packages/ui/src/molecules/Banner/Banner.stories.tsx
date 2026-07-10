import type { Meta, StoryObj } from '@storybook/react'

import { Banner } from './Banner'

const meta: Meta<typeof Banner> = {
  title: 'Componentes/Feedback/Banner',
  component: Banner,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['info', 'error', 'warning'],
      description:
        'Tipo do aviso: `info` (ícone circle-alert), `error` (ícone x) ou `warning` (ícone triangle-alert). Default `info`.',
    },
  },
  args: {
    variant: 'info',
    children: 'Sua conta é gerenciada por um administrador. Caso precise alterar algum dado, procure alguém com este acesso',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background-surface p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Banner>

export const Info: Story = {}

export const Error: Story = {
  args: { variant: 'error' },
}

export const Warning: Story = {
  args: { variant: 'warning' },
}

export const TextoLongo: Story = {
  name: 'Texto longo (divisor acompanha múltiplas linhas)',
  args: {
    variant: 'error',
    children:
      'Não foi possível sincronizar os dados da sua matrícula com o sistema acadêmico. Tente novamente em alguns minutos ou procure a secretaria caso o problema persista após múltiplas tentativas.',
  },
}
