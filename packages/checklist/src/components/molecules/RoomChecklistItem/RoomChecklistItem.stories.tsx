import type { Meta, StoryObj } from '@storybook/react'
import { RoomChecklistItem } from './RoomChecklistItem'

const meta = {
  title: 'Checklist/Molecules/RoomChecklistItem',
  component: RoomChecklistItem,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RoomChecklistItem>

export default meta
type Story = StoryObj<typeof meta>

export const ComChecklist: Story = {
  args: {
    room: '204 Laboratório de informática',
    hasChecklist: true,
  },
}

export const SemChecklist: Story = {
  args: {
    room: '204 Laboratório de informática',
    hasChecklist: false,
  },
}

export const Lista: Story = {
  args: { room: '' },
  render: () => (
    <div className="max-w-5xl">
      <RoomChecklistItem room="204 Laboratório de informática" hasChecklist />
      <RoomChecklistItem room="203 Laboratório de informática" hasChecklist={false} />
      <RoomChecklistItem room="202 Laboratório de informática" hasChecklist />
    </div>
  ),
}