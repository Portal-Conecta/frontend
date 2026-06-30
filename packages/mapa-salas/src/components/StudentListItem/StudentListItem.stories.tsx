import type { Meta, StoryObj } from '@storybook/react'
import { StudentListItem } from './StudentListItem'

const meta = {
  title: 'Mapa de Salas/StudentListItem',
  component: StudentListItem,
  parameters: { layout: 'padded' },
  args: {
    name: 'Bruno Luís Medeiros',
    isHighlighted: false,
    isEditing: false,
  },
} satisfies Meta<typeof StudentListItem>

export default meta
type Story = StoryObj<typeof meta>

/** Modo visualização — sem interação, sem destaque */
export const Default: Story = {}

/** Modo edição — operável por mouse e teclado, mas sem seleção */
export const Editing: Story = {
  args: { isEditing: true },
}

/** Aluno selecionado para alocação (modo edição) */
export const Highlighted: Story = {
  args: { isHighlighted: true, isEditing: true },
}

/** Todos os estados lado a lado */
export const AllStates: Story = {
  render: (args) => (
    <ul className="flex flex-col gap-1 w-64">
      <StudentListItem {...args} name="Amanda Salvador" />
      <StudentListItem {...args} name="Bruno Luís Medeiros" isHighlighted />
      <StudentListItem {...args} name="Daniel Muller" />
      <StudentListItem {...args} name="Eduarda Ferrazza Stein" />
    </ul>
  ),
  args: { isEditing: true },
}
