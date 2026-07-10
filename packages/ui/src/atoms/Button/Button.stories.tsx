import type { Meta, StoryObj } from '@storybook/react'

import { iconRegistry, type IconName } from '../Icon'
import { Button, type ButtonTone, type ButtonVariant } from './Button'

const iconOptions = [undefined, ...(Object.keys(iconRegistry) as IconName[])]

const variants: ButtonVariant[] = ['solid', 'outlined', 'ghost', 'link']
const tones: ButtonTone[] = ['brand', 'positive', 'negative']

const meta = {
  title: 'Componentes/Ações/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variants,
      description: 'Forma do botão. Default `solid`.',
    },
    tone: {
      control: 'inline-radio',
      options: tones,
      description: 'Cor semântica, vinda de token. Default `brand`.',
    },
    icon: {
      control: 'select',
      options: iconOptions,
      description: 'Ícone do modo icon-only (sem children). Exige `aria-label`.',
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
  args: { children: 'Button', variant: 'solid', tone: 'brand' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — passe o mouse para ver hover/active e Tab para o foco. */
export const Default: Story = {}

export const Solid: Story = { args: { variant: 'solid' } }
export const Outlined: Story = { args: { variant: 'outlined' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = { args: { variant: 'link' } }

/** Matriz completa: cada forma (`variant`) em cada cor (`tone`). */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          {tones.map((tone) => (
            <Button {...args} key={tone} variant={variant} tone={tone}>
              {variant}/{tone}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Com ícone à esquerda (do set aprovado), compondo o átomo Icon. */
export const WithIcon: Story = {
  args: { iconLeft: 'search', children: 'Buscar' },
}

/** `size="sm"`: label 12px regular (`label-xs`) — botões compactos dos menus de ação (Figma). */
export const Small: Story = {
  args: { size: 'sm', variant: 'outlined', iconLeft: 'pin', children: 'Fixar' },
}

/** Icon-only: sem `children`, com `icon` + `aria-label` obrigatório. */
export const IconOnly: Story = {
  args: { icon: 'search', children: undefined, 'aria-label': 'Buscar' },
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
