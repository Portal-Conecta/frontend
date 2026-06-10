import type { Meta, StoryObj } from '@storybook/react'

import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'overlay'] },
    type: { control: 'inline-radio', options: ['text', 'email', 'password'] },
    error: { control: 'text' },
    iconRight: { control: 'select', options: [undefined, 'search', 'mail'] },
    disabled: { control: 'boolean' },
  },
  args: { placeholder: 'Placeholder' },
  decorators: [
    (Story) => (
      <div className="max-w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}

/** Filled é automático: ao digitar, o texto vai para text/primary. */
export const Filled: Story = {
  args: { defaultValue: 'usuario@senai.br' },
}

/** type=password adiciona o toggle de olho (eye / eye-closed). */
export const Password: Story = {
  args: { type: 'password', placeholder: 'Senha' },
}

/** Ícone suffix estático (não-password). */
export const WithIconRight: Story = {
  args: { iconRight: 'search', placeholder: 'Buscar' },
}

/** Erro: barra vermelha + mensagem (label-xs). A borda permanece neutra, como no DS. */
export const ErrorState: Story = {
  args: { error: 'E-mail inválido', defaultValue: 'usuario@' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/** tone="overlay" sobre o painel azul — é o input da tela de Login. */
export const Overlay: Story = {
  args: { tone: 'overlay', type: 'password', placeholder: 'Senha' },
  decorators: [
    (Story) => (
      <div className="max-w-80 rounded-md bg-interactive-default p-6">
        <Story />
      </div>
    ),
  ],
}

/** Overlay + erro: mensagem em branco (segue o tom). */
export const OverlayError: Story = {
  args: { tone: 'overlay', error: 'Campo obrigatório' },
  decorators: [
    (Story) => (
      <div className="max-w-80 rounded-md bg-interactive-default p-6">
        <Story />
      </div>
    ),
  ],
}
