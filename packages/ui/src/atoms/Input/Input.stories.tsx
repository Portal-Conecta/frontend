import type { Meta, StoryObj } from '@storybook/react'

import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Componentes/Inputs/Input/Input',
  component: Input,
  parameters: { layout: 'padded' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['default', 'brand', 'overlay'],
      description:
        'Tom: `default` (claro), `brand` (borda e ícones em cor de marca) ou `overlay` (transparente/branco, p/ painéis coloridos).',
    },
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'password'],
      description: 'Tipo do input nativo. `password` ativa o toggle de olho.',
    },
    error: {
      control: 'text',
      description: 'Mensagem de erro. A presença ativa o estado de erro (barra + mensagem).',
    },
    iconLeft: {
      control: 'select',
      options: [undefined, 'search', 'mail'],
      description: 'Ícone à esquerda (set aprovado). Convive com `type="password"`.',
    },
    iconRight: {
      control: 'select',
      options: [undefined, 'search', 'mail'],
      description: 'Ícone à direita (set aprovado). Ignorado quando `type="password"`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilita o campo (atributo nativo).',
    },
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

/** Ícone prefix estático. */
export const WithIconLeft: Story = {
  args: { iconLeft: 'search', placeholder: 'Buscar' },
}

/** Os dois lados juntos — e `iconLeft` também convive com o toggle de senha. */
export const WithBothIcons: Story = {
  args: { iconLeft: 'mail', iconRight: 'search', placeholder: 'Buscar por e-mail' },
}

/** Erro: barra vermelha + mensagem (label-xs). A borda permanece neutra, como no DS. */
export const ErrorState: Story = {
  args: { error: 'E-mail inválido', defaultValue: 'usuario@' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * tone="brand": borda e ícones em cor de marca; o valor digitado segue
 * text/primary. Hover e foco escurecem a borda para interactive/pressed —
 * `border-focus` seria invisível aqui, já que é o mesmo blue/500 da borda em repouso.
 */
export const Brand: Story = {
  args: { tone: 'brand', defaultValue: 'usuario@senai.br', iconLeft: 'mail' },
}

/** Brand + erro: a mensagem segue feedback/error, não o tom — erro não é marca. */
export const BrandError: Story = {
  args: { tone: 'brand', error: 'E-mail inválido', defaultValue: 'usuario@' },
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
