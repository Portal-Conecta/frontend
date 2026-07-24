'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Icon, Text } from '@portal/ui'

import { HttpError } from '../http/errors'
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

export interface ClassRepresentativesPanelProps {
  /** Id da turma no Hub. */
  classId: string
  /** Rótulo do cabeçalho (ex.: `MIDS - 78`). */
  title: string
  /** Destino do voltar (detalhe da turma). */
  backHref: string
}

/** Gerencia os dois representantes da turma usando o BFF de vínculos (#365). */
export function ClassRepresentativesPanel({
  classId,
  title,
  backHref,
}: ClassRepresentativesPanelProps) {
  const router = useRouter()
  const activeRef = useRef(true)
  const [students, setStudents] = useState<ClassMember[]>([])
  const [representatives, setRepresentatives] = useState<ClassMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function goBack() {
    router.push(backHref)
  }

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
      const members = await listClassMembersClient(classId)

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
  }, [syncMembers, classId])

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
      await setClassRepresentativeClient(classId, student.id, true)
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
      await setClassRepresentativeClient(classId, representative.id, false)
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
          aria-label="Voltar para o detalhe da turma"
          className="inline-flex items-center gap-2 text-text-brand transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          onClick={goBack}
        >
          <Icon name="chevron-left" size="sm" decorative />
          <Text as="span" variant="heading-h3" tone="brand">
            {title}
          </Text>
        </button>

        <Button size="sm" variant="outlined" iconLeft="chevron-left" onClick={goBack}>
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

          {/* `ListItem` (dentro de `AssociateUsersCard`) sempre desenha `border-b`, inclusive
          no último item — sem essa classe, a borda dele soma com a deste card e vira linha dupla. */}
          <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2 [&>*:last-child]:border-b-0">
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

          {/* `ListItem` (dentro de `AssociateUsersCard`) sempre desenha `border-b`, inclusive
          no último item — sem essa classe, a borda dele soma com a deste card e vira linha dupla. */}
          <div className="flex flex-col gap-2 rounded-md border-sm border-border-default p-2 [&>*:last-child]:border-b-0">
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
        <Button size="sm" variant="outlined" onClick={goBack}>
          Voltar
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
