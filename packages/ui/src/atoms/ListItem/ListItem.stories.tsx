import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ListItem } from './ListItem'

const meta = {
  title: 'Componentes/Data/ListItem',
  component: ListItem,
  parameters: { layout: 'padded' },
  argTypes: {
    selectable: {
      control: 'boolean',
      description: 'Define se o item é clicável/selecionável.',
    },
    selected: {
      control: 'boolean',
      description: 'Aplica a borda completa azul (pressed).',
    },
    disableHover: {
      control: 'boolean',
      description: 'Remove o comportamento de hover da borda inferior.',
    },
  },
  args: {
    children: 'Conteúdo de exemplo do ListItem',
    selectable: false,
    selected: false,
    disableHover: false,
  },
} satisfies Meta<typeof ListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const HoverDisabled: Story = {
  args: {
    disableHover: true,
  },
}

export const Selectable: Story = {
  args: {
    selectable: true,
    children: 'Item selecionável (clique para testar a seleção)',
  },
  render: (args) => {
    // Usamos o useState do React para controlar o estado localmente na story
    const [isSelected, setIsSelected] = useState(args.selected ?? false)

    return (
      <ListItem
        {...args}
        selected={isSelected}
        onClick={() => setIsSelected(!isSelected)}
      />
    )
  }
}

export const Selected: Story = {
  args: {
    selectable: true,
    selected: true,
    children: 'Item selecionado (borda completa pressed)',
  },
}
