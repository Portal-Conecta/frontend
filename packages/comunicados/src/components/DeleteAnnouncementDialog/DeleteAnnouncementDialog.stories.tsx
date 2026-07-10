import { useState } from 'react'
import { DeleteAnnouncementDialog } from './DeleteAnnouncementDialog'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof DeleteAnnouncementDialog> = {
  title: 'Comunicados/Molecules/DeleteAnnouncementDialog',
  component: DeleteAnnouncementDialog,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Aberto: Story = {
  args: {
    open: true,
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const Interativo: Story = {
  args: { open: false, onConfirm: () => {}, onCancel: () => {} },
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="p-6" style={{ minHeight: '100vh' }}>
        <button
          type="button"
          className="rounded-md bg-interactive-negative-default px-4 py-2 text-label-md text-text-inverse"
          onClick={() => setOpen(true)}
        >
          Deletar comunicado
        </button>
        <DeleteAnnouncementDialog
          open={open}
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </div>
    )
  },
}