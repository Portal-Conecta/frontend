import type { Meta, StoryObj } from '@storybook/react'

import { iconRegistry, type IconName } from '../Icon'
import { Button } from './Button'

const iconOptions = [undefined, ...(Object.keys(iconRegistry) as IconName[])]

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'outlined'],
      description: 'Estilo do botão. Default `primary`.',
    },
    iconLeft: {
      control: 'select',
      options: iconOptions,
      description: 'Ícone à esquerda do label (do set aprovado do DS).',
    },
    iconRight: {
      control: 'select',
      options: iconOptions,
      description: 'Ícone à direita do label.',
    },
    loading: {
      control: 'boolean',
      description: 'Mostra spinner, desabilita e marca `aria-busy`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Ocupa toda a largura disponível.',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilita o botão (atributo nativo).',
    },
  },
  args: { children: 'Button', variant: 'primary' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — passe o mouse para ver hover/active e Tab para o foco. */
export const Default: Story = {}

export const Primary: Story = { args: { variant: 'primary' } }

export const Outlined: Story = { args: { variant: 'outlined' } }

/** Com ícone à esquerda (do set aprovado), compondo o átomo Icon. */
export const WithIcon: Story = {
  args: { iconLeft: 'search', children: 'Buscar' },
}

/** Loading: spinner automático + desabilitado + aria-busy. */
export const Loading: Story = {
  args: { loading: true, children: 'Entrando' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Entrar' },
  parameters: { layout: 'padded' },
}

/** Primary e Outlined lado a lado. Passe o mouse / use Tab para ver os estados. */
export const Overview: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} variant="primary" />
      <Button {...args} variant="outlined" />
      <Button {...args} variant="primary" iconLeft="search" />
      <Button {...args} variant="primary" loading />
      <Button {...args} variant="primary" disabled />
    </div>
  ),
}
