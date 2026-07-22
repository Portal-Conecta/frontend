import type { Meta, StoryObj } from '@storybook/react'

import { CreateClassFormContent } from './CreateClassForm'

const MOCK_COURSES = [
  { id: '1', code: 'MIDS', name: 'Desenvolvimento de Sistemas' },
  { id: '2', code: 'MADS', name: 'Análise e Desenvolvimento de Sistemas' },
  { id: '3', code: 'MELT', name: 'Eletrotécnica' },
  { id: '4', code: 'MMEC', name: 'Mecânica' },
]

// `CreateClassFormContent`, não `CreateClassForm`: a metade apresentacional do
// par não depende de `useRouter`/App Router, então a story roda sem precisar
// de `parameters.nextjs.appDirectory` (ver AGENTS.md > dívidas técnicas).
const meta: Meta<typeof CreateClassFormContent> = {
  title: 'Turmas/CreateClassForm',
  component: CreateClassFormContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    courses: MOCK_COURSES,
    onSuccess: () => undefined,
    onCancel: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof CreateClassFormContent>

export const Default: Story = {
  args: {
    onSubmitClass: async () =>
      new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000)),
  },
}

export const ComErro: Story = {
  args: {
    onSubmitClass: async () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'Erro inesperado' }), 1000),
      ),
  },
}

export const SemCursos: Story = {
  args: {
    courses: [],
    onSubmitClass: async () => ({ success: true }),
  },
}

export const FalhaAoCarregar: Story = {
  args: {
    courses: [],
    coursesLoadFailed: true,
    onSubmitClass: async () => ({ success: true }),
  },
}
