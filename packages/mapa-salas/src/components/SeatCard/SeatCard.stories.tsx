import type { Meta, StoryObj } from '@storybook/react'

import { SeatCard } from './SeatCard'

const meta = {
  title: 'Molecules/SeatCard',
  component: SeatCard,
  parameters: { layout: 'centered' },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['available', 'occupied', 'selected', 'teacher'],
    },
    isEditing: { control: 'boolean' },
  },
  args: {
    state: 'available',
    isEditing: false,
  },
} satisfies Meta<typeof SeatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  args: { state: 'available' },
}

export const Occupied: Story = {
  args: { state: 'occupied', label: 'Maria Silva' },
}

export const Selected: Story = {
  args: { state: 'selected', label: 'Maria Silva' },
}

export const Teacher: Story = {
  args: { state: 'teacher' },
}

export const EditingMode: Story = {
  name: 'Modo edição (clicável)',
  args: { state: 'available', isEditing: true },
}

export const AllStates: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <SeatCard {...args} state="available" />
      <SeatCard {...args} state="occupied" label="Maria Silva" />
      <SeatCard {...args} state="selected" label="Maria Silva" />
      <SeatCard {...args} state="teacher" />
    </div>
  ),
}