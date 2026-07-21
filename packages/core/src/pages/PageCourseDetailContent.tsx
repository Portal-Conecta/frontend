'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { HUB_SHIFT, HUB_SHIFT_LABELS, type HubShift } from '@portal/shared'
import { Button, Icon, Text } from '@portal/ui'
import { EmptyState } from '@portal/ui/molecules/EmptyState'

import { filterCourseClasses, type CourseClassesTab } from '../courses/courseDetailFilters'
import type { Course, CourseClass, CourseDetail } from '../courses/types'
import { CourseEditPanel } from './CourseEditPanel'

const SHIFT_OPTIONS: readonly { value: HubShift; label: string }[] = [
  { value: HUB_SHIFT.FULL_AM_PM, label: 'Manhã/Tarde' },
  { value: HUB_SHIFT.FULL_PM_NT, label: 'Tarde/Noite' },
]

export function PageCourseDetailContent({ initialCourse }: { initialCourse: CourseDetail }) {
  const router = useRouter()
  const [course, setCourse] = useState(initialCourse)
  const [tab, setTab] = useState<CourseClassesTab>('active')
  const [shift, setShift] = useState<HubShift | null>(null)
  const [editing, setEditing] = useState(false)

  const classes = useMemo(
    () => filterCourseClasses(course.classes, tab, shift),
    [course.classes, shift, tab],
  )

  function handleCourseUpdated(updated: Course) {
    setCourse((current) => ({ ...current, ...updated }))
  }

  return (
    <div className="flex min-h-full flex-col p-4 md:p-8">
      <div className="flex items-center gap-2 border-b border-border-default pb-4">
        <button
          type="button"
          aria-label="Voltar para cursos"
          onClick={() => router.push('/cursos')}
          className="shrink-0 rounded-sm text-interactive-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <Icon name="chevron-left" size="md" decorative />
        </button>
        <Text as="h1" variant="heading-h3" tone="brand">
          {course.code} - {course.name}
        </Text>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:items-start">
        <section className="min-w-0">
          <div role="tablist" aria-label="Situação das turmas" className="flex gap-5">
            <CourseTab active={tab === 'active'} onClick={() => setTab('active')}>
              Turmas Ativas
            </CourseTab>
            <CourseTab active={tab === 'inactive'} onClick={() => setTab('inactive')}>
              Turmas Inativas
            </CourseTab>
          </div>

          <div className="mt-4 min-h-72 rounded-md border border-border-default">
            {classes.length === 0 ? (
              <EmptyState
                title="Não tem nada aqui por enquanto :/"
                description={
                  shift
                    ? 'Nenhuma turma corresponde ao turno selecionado.'
                    : `Este curso não possui turmas ${tab === 'active' ? 'ativas' : 'inativas'}.`
                }
                illustration={
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
                    <Icon name="graduation-cap" size="lg" decorative />
                  </span>
                }
              />
            ) : (
              <ul className="divide-y divide-border-default">
                {classes.map((courseClass) => (
                  <CourseClassRow
                    key={courseClass.id}
                    courseClass={courseClass}
                    onManage={() => router.push(`/turmas/${courseClass.id}`)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div>
            <Text as="h2" variant="label-md-emphasis" tone="brand">
              Filtrar por turno:
            </Text>
            <div role="group" aria-label="Filtrar por turno" className="mt-3 flex gap-3">
              {SHIFT_OPTIONS.map((option) => {
                const selected = shift === option.value
                return (
                  <Button
                    key={option.value}
                    variant={selected ? 'solid' : 'outlined'}
                    size="sm"
                    aria-pressed={selected}
                    className="flex-1"
                    onClick={() => setShift(selected ? null : option.value)}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>
          <Button iconLeft="square-pen" onClick={() => setEditing(true)}>
            Editar Curso
          </Button>
        </aside>
      </div>

      <CourseEditPanel
        course={course}
        open={editing}
        onClose={() => setEditing(false)}
        onUpdated={handleCourseUpdated}
      />
    </div>
  )
}

function CourseTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'border-b-2 pb-2 text-label-md-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        active ? 'border-interactive-default text-text-brand' : 'border-transparent text-text-secondary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function CourseClassRow({ courseClass, onManage }: { courseClass: CourseClass; onManage: () => void }) {
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[6rem_minmax(0,1fr)_8rem] sm:items-center">
        <Text variant="label-md-emphasis" tone="brand">
          {courseClass.name}
        </Text>
        <Text variant="body-sm" tone="secondary" className="sm:border-x sm:border-border-default sm:px-4">
          Turma {courseClass.number}
        </Text>
        <Text variant="body-sm" tone="secondary" className="sm:pl-4">
          {HUB_SHIFT_LABELS[courseClass.shift]}
        </Text>
      </div>
      <Button variant="outlined" size="sm" iconLeft="chevron-right" onClick={onManage}>
        Gerenciar
      </Button>
    </li>
  )
}
