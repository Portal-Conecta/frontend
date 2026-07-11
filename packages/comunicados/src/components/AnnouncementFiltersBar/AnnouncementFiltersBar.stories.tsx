import type { Meta, StoryObj } from '@storybook/react'

<<<<<<< feature/#272-filtros-variante-alunos-skeleton
import { AnnouncementFiltersBar } from './AnnouncementFiltersBar'

const cursoOptions = [
  { value: 'todos', label: 'Todos' },
  {
    value: 'desenvolvimento-de-sistemas',
    label: 'Desenvolvimento de Sistemas',
  },
  { value: 'eletromecanica', label: 'Eletromecânica' },
]

const tipoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'aviso', label: 'Aviso' },
  { value: 'evento', label: 'Evento' },
]

const turmaOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'ds-2026', label: 'DS 2026' },
  { value: 'ds-2027', label: 'DS 2027' },
]

const turnoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'noturno', label: 'Noturno' },
]

const periodoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
=======
import { AnnouncementFiltersBar, MURAL_PERIODO_OPTIONS, MURAL_TIPO_OPTIONS } from './AnnouncementFiltersBar'
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
>>>>>>> develop
]

const meta: Meta<typeof AnnouncementFiltersBar> = {
  title: 'Comunicados/Organisms/AnnouncementFiltersBar',
  component: AnnouncementFiltersBar,
  parameters: { layout: 'padded' },
  args: {
    cursoOptions,
    tipoOptions: MURAL_TIPO_OPTIONS,
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

<<<<<<< feature/#272-filtros-variante-alunos-skeleton
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
=======
export const Default: Story = {}
>>>>>>> develop

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
