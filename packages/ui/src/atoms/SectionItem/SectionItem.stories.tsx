import type { Meta, StoryObj } from '@storybook/react'

import { SectionItem } from './SectionItem'

const meta: Meta<typeof SectionItem> = {
  title: 'Componentes/Navegação/Section/SectionItem',
  component: SectionItem,
  parameters: { layout: 'padded' },
  argTypes: {
    selected: { control: 'boolean', description: 'Aplica a régua inferior de seleção.' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { children: 'Selecionar sala', selected: false, disabled: false },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SectionItem>

/** Playground — alterne `selected`/`disabled` nos controles. */
export const Default: Story = {}

/** Selecionado: cor de marca + régua inferior. */
export const Selected: Story = { args: { selected: true } }

/** Desabilitado: cinza, sem régua, sem foco. */
export const Disabled: Story = { args: { disabled: true } }

/** Os três estados da referência, empilhados. */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <SectionItem selected>Selecionar sala</SectionItem>
      <SectionItem>Selecionar sala</SectionItem>
      <SectionItem disabled>Selecionar sala</SectionItem>
    </div>
  ),
}
