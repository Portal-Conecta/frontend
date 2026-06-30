import type { Meta, StoryObj } from '@storybook/react'
import { SeatCard } from './SeatCard'

const meta = {
  title: 'Molecules/SeatCard',
  component: SeatCard,
  parameters: { layout: 'centered' },
  args: {
    state: 'available',
    isEditing: false,
  },
} satisfies Meta<typeof SeatCard>

export default meta
type Story = StoryObj<typeof meta>

/** Assento livre, sem aluno — cinza, sem borda */
export const Available: Story = {
  args: { state: 'available' },
}

/** Assento com aluno alocado, não selecionado — azul (interactive-default), sem borda */
export const Occupied: Story = {
  args: { state: 'occupied', label: 'Vinicius Z.' },
}

/** Assento selecionado / em troca — azul (blue/300), sem borda */
export const Selected: Story = {
  args: { state: 'selected', label: 'Você', isEditing: true },
}

/** Mesa do professor — azul, sem borda, ícone variant teacher */
export const Teacher: Story = {
  args: { state: 'teacher' },
}

/** Todos os estados lado a lado, como na referência visual */
export const AllStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <SeatCard state="teacher" />
      <SeatCard state="available" isEditing />
      <SeatCard state="selected" label="Você" isEditing />
      <SeatCard state="occupied" label="Vinicius Z." isEditing />
    </div>
  ),
}