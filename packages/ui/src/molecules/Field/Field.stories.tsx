import type { Meta, StoryObj } from '@storybook/react'

import { Field } from './Field'

const meta: Meta<typeof Field> = {
  title: 'Componentes/Formulário/Field',
  component: Field,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Field>

export const Default: Story = {
  args: {
    label: 'Titulo',
    placeholder: 'placeholder',
  },
}

export const WithError: Story = {
  args: {
    label: 'E-mail',
    placeholder: 'seu@email.com',
    error: 'E-mail inválido.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Campo desabilitado',
    placeholder: 'Não editável',
    disabled: true,
  },
}

export const Password: Story = {
  args: {
    label: 'Senha',
    placeholder: '••••••••',
    type: 'password',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Busca',
    placeholder: 'Pesquisar...',
    iconRight: 'search',
  },
}

export const Overlay: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md bg-interactive-default p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Usuário',
    placeholder: 'Digite seu usuário',
    tone: 'overlay',
  },
}
