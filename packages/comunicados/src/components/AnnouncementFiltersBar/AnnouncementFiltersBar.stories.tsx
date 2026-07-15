import type { Meta, StoryObj } from '@storybook/react'

import { AnnouncementFiltersBar, MURAL_ORIGEM_OPTIONS, MURAL_PERIODO_OPTIONS } from './AnnouncementFiltersBar'
import type { ClassFilterOption } from '../../services/destinationCatalogMappers'
import { HUB_SHIFT_OPTIONS } from '../../constants/hubShifts'

const cursoOptions = [
  { value: 'course-ds', label: 'Desenvolvimento de Sistemas' },
  { value: 'course-em', label: 'Eletromecânica' },
]

const turmaOptions: ClassFilterOption[] = [
  { value: 'class-ds-2026', label: 'DS 2026', courseId: 'course-ds', shift: 'FULL_AM_PM' },
  { value: 'class-ds-2027', label: 'DS 2027', courseId: 'course-ds', shift: 'FULL_PM_NT' },
  { value: 'class-em-2026', label: 'EM 2026', courseId: 'course-em', shift: 'FULL_AM_PM' },
]

const meta: Meta<typeof AnnouncementFiltersBar> = {
  title: 'Comunicados/Organisms/AnnouncementFiltersBar',
  component: AnnouncementFiltersBar,
  parameters: { layout: 'padded' },
  args: {
    cursoOptions,
    origemOptions: MURAL_ORIGEM_OPTIONS,
    turmaOptions,
    turnoOptions: HUB_SHIFT_OPTIONS,
    periodoOptions: MURAL_PERIODO_OPTIONS,
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AnnouncementFiltersBar>

export const Default: Story = {
  args: {
    userType: 'ADMIN',
    loading: false,
  },
}

export const VarianteAluno: Story = {
  args: {
    userType: 'STUDENT',
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    userType: 'ADMIN',
    loading: true,
  },
}

export const SkeletonAluno: Story = {
  args: {
    userType: 'STUDENT',
    loading: true,
  },
}
