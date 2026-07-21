'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { useRouter } from 'next/navigation'

import { HUB_SHIFT, HUB_SHIFT_LABELS, type HubShift } from '@portal/shared'
import { Button, EmptyState, Icon, Text } from '@portal/ui'

import { filterCourseClasses, type CourseClassesTab } from '../courses/courseDetailFilters'
import type { Course, CourseClass, CourseDetail } from '../courses/types'
import { CourseEditPanel } from './CourseEditPanel'

const SHIFT_OPTIONS: readonly { value: HubShift; label: string }[] = [
  { value: HUB_SHIFT.FULL_AM_PM, label: 'Manhã/Tarde' },
  { value: HUB_SHIFT.FULL_PM_NT, label: 'Tarde/Noite' },
]

export function PageCourseDetailContent({ initialCourse }: { initialCourse: CourseDetail }) {
  const router = useRouter()
  const activeTabId = useId()
  const inactiveTabId = useId()
  const tabPanelId = useId()
  const activeTabRef = useRef<HTMLButtonElement>(null)
  const inactiveTabRef = useRef<HTMLButtonElement>(null)
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

  function selectTab(nextTab: CourseClassesTab) {
    setTab(nextTab)
    const target = nextTab === 'active' ? activeTabRef : inactiveTabRef
    requestAnimationFrame(() => target.current?.focus())
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    selectTab(tab === 'active' ? 'inactive' : 'active')
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
          <div role="tablist" aria-label="Situação das turmas" className="flex gap-4">
            <CourseTab
              ref={activeTabRef}
              id={activeTabId}
              controls={tabPanelId}
              active={tab === 'active'}
              onClick={() => setTab('active')}
              onKeyDown={handleTabKeyDown}
            >
              Turmas Ativas
            </CourseTab>
            <CourseTab
              ref={inactiveTabRef}
              id={inactiveTabId}
              controls={tabPanelId}
              active={tab === 'inactive'}
              onClick={() => setTab('inactive')}
              onKeyDown={handleTabKeyDown}
            >
              Turmas Inativas
            </CourseTab>
          </div>

          <div
            id={tabPanelId}
            role="tabpanel"
            aria-labelledby={tab === 'active' ? activeTabId : inactiveTabId}
            tabIndex={0}
            className="mt-4 rounded-md border border-border-default"
          >
            {classes.length === 0 ? (
              <EmptyState
                title="Não tem nada aqui por enquanto :/"
                description={
                  shift
                    ? 'Nenhuma turma corresponde ao turno selecionado.'
                    : `Este curso não possui turmas ${tab === 'active' ? 'ativas' : 'inativas'}.`
                }
                illustration={
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-subtle text-interactive-default">
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
  ref,
  id,
  controls,
  active,
  onClick,
  onKeyDown,
  children,
}: {
  ref: Ref<HTMLButtonElement>
  id: string
  controls: string
  active: boolean
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  children: string
}) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
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
