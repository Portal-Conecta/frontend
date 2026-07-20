'use client'

/**
 * TurmaList — a linha de busca + a lista de turmas (client). Recebe as turmas já
 * buscadas no servidor pela `PageTurma` e detém só o estado da **busca de texto**,
 * filtrando no cliente (`filterTurmas`) — o back não filtra. Cada turma é um
 * `ListItem`; sem resultados, mostra um estado vazio.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, ClassCard, Input, ListItem, Text } from '@portal/ui'

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
import type { ClassMember } from './types'

export interface TurmaListProps {
  turmas: TurmaRow[]
}

export function TurmaList({ turmas }: TurmaListProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TurmaFilters>({})
  const [selectedTurma, setSelectedTurma] = useState<TurmaRow | null>(null)

  // Opções derivadas da lista completa (não da filtrada) para ficarem estáveis
  // enquanto se filtra.
  const { courses, shifts } = useMemo(() => turmaFilterOptions(turmas), [turmas])

  const filtered = useMemo(
    () => filterTurmas(applyTurmaFilters(turmas, filters), query),
    [turmas, filters, query],
  )

  // "Restaurar" limpa o filtro aplicado na hora (não espera "Aplicar").
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
                <TurmaRowItem key={turma.id} turma={turma} onManage={setSelectedTurma} />
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

/** Uma turma na lista — no mobile o curso e o turno empilham; no `md+` viram colunas. */
function TurmaRowItem({ turma, onManage }: { turma: TurmaRow; onManage: (turma: TurmaRow) => void }) {
  return (
    <ListItem className="flex items-center justify-between gap-2 md:gap-4">
      <ClassCard
        variant="single"
        item={{ code: turma.code, course: turma.course, shift: turma.shift }}
      />
      <span className="hidden md:inline-flex">
        <Button size="sm" variant="outlined" iconLeft="chevron-right" onClick={() => onManage(turma)}>
          Gerenciar
        </Button>
      </span>
      <span className="inline-flex md:hidden">
        <Button
          size="sm"
          variant="outlined"
          icon="chevron-right"
          aria-label={`Gerenciar ${turma.code}`}
          onClick={() => onManage(turma)}
        />
      </span>
    </ListItem>
  )
}

function ClassRepresentativesPanel({ turma, onClose }: { turma: TurmaRow; onClose: () => void }) {
  const [students, setStudents] = useState<ClassMember[]>([])
  const [representatives, setRepresentatives] = useState<ClassMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncMembers = useCallback(
    (studentMembers: ClassMember[], representativeMembers: ClassMember[]) => {
      const currentRepresentatives = getRepresentativeMembers(representativeMembers)

      setRepresentatives(currentRepresentatives)
      setStudents(getRepresentativeCandidateStudents(studentMembers, currentRepresentatives))
    },
    [],
  )

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [studentMembers, representativeMembers] = await Promise.all([
        listClassMembersClient(turma.id, 'STUDENT'),
        listClassMembersClient(turma.id, 'REPRESENTATIVE'),
      ])

      syncMembers(studentMembers, representativeMembers)
    } catch {
      setError('Não foi possível carregar os representantes da turma.')
    } finally {
      setLoading(false)
    }
  }, [syncMembers, turma.id])

  useEffect(() => {
    let active = true

    async function loadActiveMembers() {
      setLoading(true)
      setError(null)

      try {
        const [studentMembers, representativeMembers] = await Promise.all([
          listClassMembersClient(turma.id, 'STUDENT'),
          listClassMembersClient(turma.id, 'REPRESENTATIVE'),
        ])

        if (active) {
          syncMembers(studentMembers, representativeMembers)
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os representantes da turma.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadActiveMembers()

    return () => {
      active = false
    }
  }, [syncMembers, turma.id])

  const limitReached = hasRepresentativeLimitReached(representatives)
  const busy = loading || actionMemberId != null

  const promoteStudent = async (student: ClassMember) => {
    if (limitReached) return

    setActionMemberId(student.id)
    setError(null)

    try {
      await setClassRepresentativeClient(turma.id, student.id, true)
      await loadMembers()
    } catch {
      setError('Não foi possível tornar este aluno representante.')
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
    } catch {
      setError('Não foi possível remover este representante.')
    } finally {
      setActionMemberId(null)
    }
  }

  return (
    <section className="mt-8 rounded-md border-sm border-border-default bg-background-surface p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Text as="h2" variant="heading-h3" tone="primary">
            Representantes da turma {turma.code}
          </Text>
          <Text variant="body-sm" tone="secondary">
            Selecione exatamente {CLASS_REPRESENTATIVE_LIMIT} alunos como representantes.
          </Text>
        </div>

        <Button size="sm" variant="ghost" iconLeft="chevron-left" onClick={onClose}>
          Voltar para turmas
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border-sm border-feedback-error/20 bg-feedback-error/5 p-3">
          <Text variant="body-sm" className="text-feedback-error">
            {error}
          </Text>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="students-title">
          <div className="mb-3">
            <Text as="h3" id="students-title" variant="label-md-emphasis" tone="primary">
              Alunos
            </Text>
            <Text variant="body-sm" tone="secondary">
              Apenas alunos aparecem como opção de representante.
            </Text>
          </div>

          <div className="space-y-2">
            {loading ? (
              <Text variant="body-sm" tone="secondary">
                Carregando alunos...
              </Text>
            ) : students.length === 0 ? (
              <Text variant="body-sm" tone="secondary">
                Nenhum aluno disponível para seleção.
              </Text>
            ) : (
              students.map((student) => (
                <ListItem key={student.id} className="flex items-center justify-between gap-3">
                  <Text variant="body-md" tone="primary">
                    {student.name}
                  </Text>
                  <Button
                    size="sm"
                    variant="outlined"
                    disabled={busy || limitReached}
                    loading={actionMemberId === student.id}
                    onClick={() => void promoteStudent(student)}
                  >
                    Tornar Representante
                  </Button>
                </ListItem>
              ))
            )}
          </div>
        </section>

        <aside
          aria-labelledby="representatives-title"
          className="rounded-md border-sm border-border-default bg-background-default p-4"
        >
          <div className="mb-3">
            <Text as="h3" id="representatives-title" variant="label-md-emphasis" tone="primary">
              Representantes atuais
            </Text>
            <Text variant="body-sm" tone="secondary">
              {representatives.length}/{CLASS_REPRESENTATIVE_LIMIT} selecionados
            </Text>
          </div>

          {limitReached ? (
            <div className="mb-3 rounded-md border-sm border-feedback-warning/20 bg-feedback-warning/5 p-3">
              <Text variant="body-sm" tone="primary">
                {CLASS_REPRESENTATIVE_LIMIT_MESSAGE}
              </Text>
            </div>
          ) : null}

          <div className="space-y-2">
            {loading ? (
              <Text variant="body-sm" tone="secondary">
                Carregando representantes...
              </Text>
            ) : representatives.length === 0 ? (
              <Text variant="body-sm" tone="secondary">
                Nenhum representante selecionado.
              </Text>
            ) : (
              representatives.map((representative) => (
                <ListItem key={representative.id} className="flex items-center justify-between gap-3">
                  <Text variant="body-md" tone="primary">
                    {representative.name}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    tone="negative"
                    icon="x"
                    aria-label={`Remover ${representative.name} dos representantes`}
                    disabled={busy}
                    loading={actionMemberId === representative.id}
                    onClick={() => void removeRepresentative(representative)}
                  />
                </ListItem>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
