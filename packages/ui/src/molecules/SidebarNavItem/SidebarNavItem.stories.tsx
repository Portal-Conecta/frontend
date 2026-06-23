import type { Meta, StoryObj } from '@storybook/react'

import { iconRegistry, type IconName } from '../../atoms/Icon'
import { SidebarNavItem } from './SidebarNavItem'

const iconNames = Object.keys(iconRegistry) as IconName[]

const meta: Meta<typeof SidebarNavItem> = {
  title: 'Molecules/SidebarNavItem',
  component: SidebarNavItem,
  parameters: { layout: 'padded' },
  argTypes: {
    icon: {
      control: 'select',
      options: iconNames,
      description: 'Ícone do item (set aprovado do DS).',
    },
    label: {
      control: 'text',
      description: 'Texto do item de navegação.',
    },
    active: {
      control: 'boolean',
      description: 'Marca o item como página atual (cor de ativo + indicador + `aria-current`).',
    },
    collapsed: {
      control: 'boolean',
      description: 'Colapsa o label (anima encolher + fade, mantido no DOM para leitores de tela).',
    },
  },
  args: {
    icon: 'newspaper',
    label: 'Comunicados',
    active: false,
    collapsed: false,
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SidebarNavItem>

export const Default: Story = {}

export const Active: Story = {
  args: { active: true },
}

/**
 * Estado de foco. No componente real a borda e a cor aparecem ao navegar por
 * teclado (`:focus-visible`); aqui forçamos as classes (com `!` important) para
 * visualização determinística — `:focus-visible` não dispara de forma confiável
 * dentro do iframe do Storybook.
 */
export const Focused: Story = {
  args: { className: 'border-border-focus! text-text-brand!' },
}

export const Collapsed: Story = {
  args: { collapsed: true },
  decorators: [
    (Story) => (
      <div className="w-24">
        <Story />
      </div>
    ),
  ],
}

export const CollapseButton: Story = {
  args: {
    icon: 'chevrons-left',
    label: 'Reduzir',
  },
}

/**
 * Estados de interação em coluna. Hover e Focused são forçados via classes
 * (`!` important) porque `:hover`/`:focus-visible` não são acionáveis num
 * render estático. Collapsed e CollapseButton têm stories próprias.
 */
export const AllStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <SidebarNavItem {...args} label="Default" />
      <SidebarNavItem {...args} label="Hover" className="text-interactive-hover!" />
      <SidebarNavItem {...args} label="Focused" className="border-border-focus! text-text-brand!" />
      <SidebarNavItem {...args} label="Active" active />
    </div>
  ),
}
