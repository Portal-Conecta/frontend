'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Button, Icon, Text } from '@portal/ui'

import { AssociateUsersCard } from './AssociateUsersCard'
import { listClassMembersClient, setClassRepresentativeClient } from './classMembersClient'
import {
  CLASS_REPRESENTATIVE_LIMIT,
  CLASS_REPRESENTATIVE_LIMIT_MESSAGE,
  getRepresentativeCandidateStudents,
  getRepresentativeMembers,
  hasRepresentativeLimitReached,
} from './classRepresentatives'
import type { ClassMember } from './types'
import type { TurmaRow } from './turmaRows'
import { HttpError } from '../http/errors'

export interface ClassRepresentativesPanelProps {
  turma: TurmaRow
  onClose: () => void
}

/** Gerencia os dois representantes da turma usando o BFF de vínculos. */
export function ClassRepresentativesPanel({ turma, onClose }: ClassRepresentativesPanelProps) {
  const activeRef = useRef(true)
  const [students, setStudents] = useState<ClassMember[]>([])
  const [representatives, setRepresentatives] = useState<ClassMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncMembers = useCallback((members: ClassMember[]) => {
    const currentRepresentatives = getRepresentativeMembers(members)

    setRepresentatives(currentRepresentatives)
    setStudents(getRepresentativeCandidateStudents(members, currentRepresentatives))
  }, [])

  const loadMembers = useCallback(async () => {
    if (!activeRef.current) return

    setLoading(true)
    setError(null)

    try {
      const members = await listClassMembersClient(turma.id)

      if (activeRef.current) {
        syncMembers(members)
      }
    } catch (err) {
      if (activeRef.current) {
        setError(getHttpErrorMessage(err, 'Não foi possível carregar os representantes da turma.'))
      }
    } finally {
      if (activeRef.current) {
        setLoading(false)
      }
    }
  }, [syncMembers, turma.id])

  useEffect(() => {
    activeRef.current = true
    void loadMembers()

    return () => {
      activeRef.current = false
    }
  }, [loadMembers])

  const limitReached = hasRepresentativeLimitReached(representatives)
  const busy = loading || actionMemberId != null

  async function promoteStudent(student: ClassMember) {
    if (limitReached || busy) return

    setActionMemberId(student.id)
    setError(null)

    try {
      await setClassRepresentativeClient(turma.id, student.id, true)
      if (activeRef.current) {
        await loadMembers()
      }
    } catch (err) {
      if (activeRef.current) {
        setError(getHttpErrorMessage(err, 'Não foi possível tornar este aluno representante.'))
      }
    } finally {
      if (activeRef.current) {
        setActionMemberId(null)
      }
    }
  }

  async function removeRepresentative(representative: ClassMember) {
    if (busy) return

    setActionMemberId(representative.id)
    setError(null)

    try {
      await setClassRepresentativeClient(turma.id, representative.id, false)
      if (activeRef.current) {
        await loadMembers()
      }
    } catch (err) {
      if (activeRef.current) {
        setError(getHttpErrorMessage(err, 'Não foi possível remover este representante.'))
      }
    } finally {
      if (activeRef.current) {
        setActionMemberId(null)
      }
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
        <section aria-labelledby="students-title" className="min-w-0 lg:col-span-2">
          <Text as="h3" id="students-title" variant="label-md-emphasis" tone="brand" className="mb-4">
            Alunos
          </Text>

          <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
            {loading ? (
              <Text variant="body-sm" tone="secondary" className="p-2">
                Carregando alunos...
              </Text>
            ) : students.length === 0 ? (
              <Text variant="body-sm" tone="secondary" className="p-2">
                Nenhum aluno disponível para seleção.
              </Text>
            ) : (
              students.map((student) => (
                <AssociateUsersCard
                  key={student.id}
                  name={student.name}
                  variant="promote"
                  disabled={busy || limitReached}
                  loading={actionMemberId === student.id}
                  onAction={() => void promoteStudent(student)}
                />
              ))
            )}
          </div>
        </section>

        <aside aria-labelledby="representatives-title" className="flex min-w-0 flex-col">
          <div className="mb-4">
            <Text as="h3" id="representatives-title" variant="label-md-emphasis" tone="primary">
              Representantes
            </Text>
            <Text variant="label-xs" tone="secondary">
              {representatives.length}/{CLASS_REPRESENTATIVE_LIMIT} selecionados
            </Text>
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

          <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2">
            {loading ? (
              <Text variant="body-sm" tone="secondary" className="p-2">
                Carregando representantes...
              </Text>
            ) : representatives.length === 0 ? (
              <Text variant="body-sm" tone="secondary" className="p-2">
                Nenhum representante selecionado.
              </Text>
            ) : (
              representatives.map((representative) => (
                <AssociateUsersCard
                  key={representative.id}
                  name={representative.name}
                  variant="remove"
                  disabled={busy}
                  loading={actionMemberId === representative.id}
                  onAction={() => void removeRepresentative(representative)}
                />
              ))
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

function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    return err.body?.message ?? err.message ?? fallback
  }

  return fallback
}

export default ClassRepresentativesPanel
