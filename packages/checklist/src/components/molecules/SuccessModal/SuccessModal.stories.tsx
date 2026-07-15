import { useState } from 'react'
import { SuccessModal } from './SuccessModal'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof SuccessModal> = {
  title: 'Checklist/Molecules/SuccessModal',
  component: SuccessModal,
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
    message: 'Checklist preenchida e enviada com sucesso',
    confirmLabel: 'Ok!',
    onClose: () => {},
  },
}

export const Interativo: Story = {
  args: {
    open: false,
    message: '',
    onClose: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="p-6" style={{ minHeight: '100vh' }}>
        <button
          type="button"
          className="rounded-md bg-interactive-default px-4 py-2 text-label-md text-text-inverse"
          onClick={() => setOpen(true)}
        >
          Enviar checklist
        </button>

        <SuccessModal
          open={open}
          message="Checklist preenchida e enviada com sucesso"
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
}