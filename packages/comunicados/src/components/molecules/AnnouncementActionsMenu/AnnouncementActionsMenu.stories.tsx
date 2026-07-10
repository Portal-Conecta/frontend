import type { Meta, StoryObj } from '@storybook/react'

import { AnnouncementActionsMenu } from './AnnouncementActionsMenu'

const meta: Meta<typeof AnnouncementActionsMenu> = {
  title: 'Comunicados/Molecules/AnnouncementActionsMenu',
  component: AnnouncementActionsMenu,
  parameters: { layout: 'padded' },
  args: {
    pinned: false,
    variant: 'outlined',
    compact: false,
    pending: null,
    onPin: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
  decorators: [
    (Story) => (
      <div className="bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/** Não fixado, sobre card branco — contorno azul/vermelho. */
export const Outlined: Story = {}

/** Fixado — troca "Fixar" por "Desafixar". */
export const OutlinedPinned: Story = {
  args: { pinned: true },
}

/** Sobre o card com gradiente (fixado no topo do mural) — sólido azul. */
export const Solid: Story = {
  args: { variant: 'solid' },
}

export const SolidPinned: Story = {
  args: { variant: 'solid', pinned: true },
}

/** Mobile — só ícone, sem rótulo. */
export const Compact: Story = {
  args: { compact: true },
}

export const CompactSolid: Story = {
  args: { compact: true, variant: 'solid', pinned: true },
}

/** Ação em andamento — desabilita os outros botões, spinner no ativo. */
export const Pending: Story = {
  args: { pending: 'delete' },
}
