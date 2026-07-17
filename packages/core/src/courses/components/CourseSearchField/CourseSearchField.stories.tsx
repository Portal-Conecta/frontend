import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { CourseSearchField } from './CourseSearchField'

/**
 * CourseSearchField — busca da lista de cursos (nome ou código), lupa à esquerda.
 */
const meta: Meta<typeof CourseSearchField> = {
  title: 'Componentes/Inputs/CourseSearchField',
  component: CourseSearchField,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof CourseSearchField>

function Controlled({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <CourseSearchField value={value} onChange={setValue} />
}

export const Vazio: Story = {
  render: () => <Controlled />,
}

export const Preenchido: Story = {
  render: () => <Controlled initial="MIDS" />,
}
