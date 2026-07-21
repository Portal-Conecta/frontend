'use client'

/**
 * TurmaList - a linha de busca + a lista de turmas (client). Recebe as turmas ja
 * buscadas no servidor pela `PageTurma` e detem so o estado da busca de texto,
 * filtrando no cliente (`filterTurmas`) - o back nao filtra. Cada turma e um
 * `ListItem`; sem resultados, mostra um estado vazio.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar, Button, ClassCard, Icon, Input, ListItem, Text } from '@portal/ui'

import {
  CLASS_REPRESENTATIVE_LIMIT,
  CLASS_REPRESENTATIVE_LIMIT_MESSAGE,
  getRepresentativeCandidateStudents,
  getRepresentativeMembers,
  hasRepresentativeLimitReached,
} from './classRepresentatives'
import { listClassMembersClient, setClassRepresentativeClient } from './classesClient'
import { TurmaFiltersForm } from './TurmaFiltersForm'
import { TurmaMobileFilters } from './TurmaMobileFilters'
import {
  applyTurmaFilters,
  filterTurmas,
  turmaFilterOptions,
  type TurmaFilters,
  type TurmaRow,
} from './turmaRows'
import { HttpError } from '../http/errors'
import type { ClassMember } from './types'

export interface TurmaListProps {
  turmas: TurmaRow[]
}

export function TurmaList({ turmas }: TurmaListProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TurmaFilters>({})
  const [selectedTurma, setSelectedTurma] = useState<TurmaRow | null>(null)

  const { courses, shifts } = useMemo(() => turmaFilterOptions(turmas), [turmas])

  const filtered = useMemo(
    () => filterTurmas(applyTurmaFilters(turmas, filters), query),
    [turmas, filters, query],
  )

  const resetFilters = () => setFilters({})

  return (
    <>
      <div className="mt-8 flex items-center gap-2">
        <Input
          className="flex-1 min-w-0"
          placeholder="Buscar turma"
          aria-label="Buscar turma"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <TurmaMobileFilters
          courseOptions={courses}
          shiftOptions={shifts}
          onApply={setFilters}
          onReset={resetFilters}
        />
      </div>

      {selectedTurma ? (
        <ClassRepresentativesPanel
          turma={selectedTurma}
          onClose={() => setSelectedTurma(null)}
        />
      ) : (
        <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div>
            {filtered.length === 0 ? (
              <Text variant="body-sm" tone="secondary">
                Nenhuma turma encontrada.
              </Text>
            ) : (
              filtered.map((turma) => (
                <TurmaRowItem
                  key={turma.id}
                  turma={turma}
                  onManageMembers={(selected) => {
                    router.push(`/turmas/${encodeURIComponent(selected.id)}/membros`)
                  }}
                  onManageRepresentatives={setSelectedTurma}
                />
              ))
            )}
          </div>

          <div className="hidden px-8 py-3 lg:block">
            <TurmaFiltersForm
              courseOptions={courses}
              shiftOptions={shifts}
              onApply={setFilters}
              onReset={resetFilters}
            />
          </div>
        </div>
      )}
    </>
  )
}

function TurmaRowItem({
  turma,
  onManageMembers,
  onManageRepresentatives,
}: {
  turma: TurmaRow
  onManageMembers: (turma: TurmaRow) => void
  onManageRepresentatives: (turma: TurmaRow) => void
}) {
  return (
    <ListItem className="flex items-center justify-between gap-2 md:gap-4">
      <ClassCard
        variant='withBackground'
        tag={turma.code}
        title={turma.course}
        meta={turma.shift}
      />
      <span className="hidden items-center gap-2 md:inline-flex">
        <Button size="sm" variant="outlined" iconLeft="chevron-right" onClick={() => onManageMembers(turma)}>
          Gerenciar
        </Button>
        <Button size="sm" variant="outlined" iconLeft="users" onClick={() => onManageRepresentatives(turma)}>
          Representantes
        </Button>
      </span>
      <span className="inline-flex items-center gap-2 md:hidden">
        <Button
          size="sm"
          variant="outlined"
          icon="users"
          aria-label={`Editar representantes de ${turma.code}`}
          onClick={() => onManageRepresentatives(turma)}
        />
        <Button
          size="sm"
          variant="outlined"
          icon="chevron-right"
          aria-label={`Gerenciar ${turma.code}`}
          onClick={() => onManageMembers(turma)}
        />
      </span>
    </ListItem>
  )
}

type RepresentativeTab = 'students' | 'teachers'

function ClassRepresentativesPanel({ turma, onClose }: { turma: TurmaRow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<RepresentativeTab>('students')
  const [students, setStudents] = useState<ClassMember[]>([])
  const [teachers, setTeachers] = useState<ClassMember[]>([])
  const [representatives, setRepresentatives] = useState<ClassMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncMembers = useCallback(
    (
      studentMembers: ClassMember[],
      teacherMembers: ClassMember[],
      representativeMembers: ClassMember[],
    ) => {
      const currentRepresentatives = getRepresentativeMembers(representativeMembers)

      setRepresentatives(currentRepresentatives)
      setStudents(getRepresentativeCandidateStudents(studentMembers, currentRepresentatives))
      setTeachers(teacherMembers.filter((member) => member.role === 'TEACHER'))
    },
    [],
  )

  const loadMembers = useCallback(
    async (isActive: () => boolean = () => true) => {
      setLoading(true)
      setError(null)

      try {
        const [studentMembers, teacherMembers, representativeMembers] = await Promise.all([
          listClassMembersClient(turma.id, 'STUDENT'),
          listClassMembersClient(turma.id, 'TEACHER'),
          listClassMembersClient(turma.id, 'REPRESENTATIVE'),
        ])

        if (isActive()) {
          syncMembers(studentMembers, teacherMembers, representativeMembers)
        }
      } catch (err) {
        if (isActive()) {
          setError(getHttpErrorMessage(err, 'Não foi possível carregar os representantes da turma.'))
        }
      } finally {
        if (isActive()) {
          setLoading(false)
        }
      }
    },
    [syncMembers, turma.id],
  )

  useEffect(() => {
    let active = true

    void loadMembers(() => active)

    return () => {
      active = false
    }
  }, [loadMembers])

  const limitReached = hasRepresentativeLimitReached(representatives)
  const busy = loading || actionMemberId != null
  const shownMembers = activeTab === 'students' ? students : teachers

  const promoteStudent = async (student: ClassMember) => {
    if (limitReached) return

    setActionMemberId(student.id)
    setError(null)

    try {
      await setClassRepresentativeClient(turma.id, student.id, true)
      await loadMembers()
    } catch (err) {
      setError(getHttpErrorMessage(err, 'Não foi possível tornar este aluno representante.'))
    } finally {
      setActionMemberId(null)
    }
  }

  const removeRepresentative = async (representative: ClassMember) => {
    setActionMemberId(representative.id)
    setError(null)

    try {
      await setClassRepresentativeClient(turma.id, representative.id, false)
      await loadMembers()
    } catch (err) {
      setError(getHttpErrorMessage(err, 'Não foi possível remover este representante.'))
    } finally {
      setActionMemberId(null)
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-md border-sm border-border-default bg-background-surface">
      <header className="flex flex-col gap-4 border-b border-border-default px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <button
          type="button"
          aria-label="Voltar para a lista de turmas"
          className="inline-flex items-center gap-2 text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          onClick={onClose}
        >
          <Icon name="chevron-left" size="sm" decorative />
          <Text as="span" variant="heading-h3" tone="brand">
            {turma.code}
          </Text>
        </button>

        <Button size="sm" variant="outlined" iconLeft="chevron-left" onClick={onClose}>
          Voltar
        </Button>
      </header>

      {error ? (
        <div
          role="alert"
          className="mx-4 mt-4 rounded-md border-sm border-feedback-error/20 bg-feedback-error/5 p-3 md:mx-6"
        >
          <Text variant="body-sm" className="text-feedback-error">
            {error}
          </Text>
        </div>
      ) : null}

      <div className="grid gap-6 px-4 py-6 lg:grid-cols-3 lg:px-6">
        <section aria-labelledby="members-title" className="min-w-0 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 border-b border-border-default">
                <RepresentativeTabButton
                  active={activeTab === 'students'}
                  onClick={() => setActiveTab('students')}
                >
                  Alunos
                </RepresentativeTabButton>
                <RepresentativeTabButton
                  active={activeTab === 'teachers'}
                  onClick={() => setActiveTab('teachers')}
                >
                  Professores
                </RepresentativeTabButton>
              </div>

              {limitReached ? (
                <div role="status" className="mt-2 border-l-2 border-feedback-warning pl-2">
                  <Text variant="label-xs" tone="brand">
                    {CLASS_REPRESENTATIVE_LIMIT_MESSAGE}
                  </Text>
                </div>
              ) : null}
            </div>
          </div>

          <div id="members-title" className="sr-only">
            Membros da turma
          </div>

          <div className="overflow-hidden rounded-md border-sm border-border-default">
            {loading ? (
              <div className="p-4">
                <Text variant="body-sm" tone="secondary">
                  Carregando alunos...
                </Text>
              </div>
            ) : shownMembers.length === 0 ? (
              <div className="p-4">
                <Text variant="body-sm" tone="secondary">
                  {activeTab === 'students'
                    ? 'Nenhum aluno disponível para seleção.'
                    : 'Nenhum professor encontrado nesta turma.'}
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-border-default">
                {shownMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-6 w-6" />
                      <Text variant="label-xs" tone="brand" className="truncate">
                        {member.name}
                      </Text>
                    </div>

                    {activeTab === 'students' ? (
                      <Button
                        size="xs"
                        variant="outlined"
                        disabled={busy || limitReached}
                        loading={actionMemberId === member.id}
                        onClick={() => void promoteStudent(member)}
                      >
                        Tornar Representante
                      </Button>
                    ) : (
                      <Text variant="label-xs" tone="secondary">
                        Professor
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside aria-labelledby="representatives-title" className="flex min-w-0 flex-col">
          <div className="mb-4">
            <div>
              <Text as="h3" id="representatives-title" variant="label-md-emphasis" tone="primary">
                Representantes
              </Text>
              <Text variant="label-xs" tone="secondary">
                {representatives.length}/{CLASS_REPRESENTATIVE_LIMIT} selecionados
              </Text>
            </div>
          </div>

          {limitReached ? (
            <div
              role="status"
              className="mb-3 rounded-md border-sm border-feedback-warning/20 bg-feedback-warning/5 p-3"
            >
              <Text variant="body-sm" tone="primary">
                {CLASS_REPRESENTATIVE_LIMIT_MESSAGE}
              </Text>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-md border-sm border-border-default">
            {loading ? (
              <div className="p-4">
                <Text variant="body-sm" tone="secondary">
                  Carregando representantes...
                </Text>
              </div>
            ) : representatives.length === 0 ? (
              <div className="p-4">
                <Text variant="body-sm" tone="secondary">
                  Nenhum representante selecionado.
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-border-default">
                {representatives.map((representative) => (
                  <div
                    key={representative.id}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-6 w-6" />
                      <Text variant="label-xs" tone="brand" className="truncate">
                        {representative.name}
                      </Text>
                    </div>
                    <Button
                      size="xs"
                      variant="outlined"
                      tone="negative"
                      icon="x"
                      aria-label={`Remover ${representative.name} dos representantes`}
                      disabled={busy}
                      loading={actionMemberId === representative.id}
                      onClick={() => void removeRepresentative(representative)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="flex justify-end border-t border-border-default px-4 py-4 md:px-6">
        <Button size="sm" variant="outlined" onClick={onClose}>
          Voltar para turmas
        </Button>
      </footer>
    </section>
  )
}

function RepresentativeTabButton({
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
      className={[
        'border-b-2 pb-2 text-label-xs font-inter transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        active
          ? 'border-interactive-default text-interactive-default'
          : 'border-transparent text-text-secondary hover:text-interactive-hover',
      ].join(' ')}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    return err.body?.message ?? err.message ?? fallback
  }

  return fallback
}
