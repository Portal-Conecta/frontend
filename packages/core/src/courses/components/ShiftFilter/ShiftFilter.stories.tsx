import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import type { HubShift } from '@portal/shared'

import { ShiftFilter } from './ShiftFilter'

/**
 * ShiftFilter — filtro por turno da lista de cursos (seleção única, clicar no
 * ativo desmarca).
 */
const meta: Meta<typeof ShiftFilter> = {
  title: 'Componentes/Ações/ShiftFilter',
  component: ShiftFilter,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ShiftFilter>

function Controlled() {
  const [value, setValue] = useState<HubShift | null>(null)
  return <ShiftFilter value={value} onChange={setValue} className="max-w-xs" />
}

export const Interativo: Story = {
  render: () => <Controlled />,
}
