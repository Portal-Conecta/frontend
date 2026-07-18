'use client'

import { useEffect, useState } from 'react'

import { listMyClassStudentsClient } from '../services/client/destinationsClient'
import type { UserSummary } from '../components/DestinationSelector/types'

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Aluno',
  REPRESENTATIVE: 'Representante',
  TEACHER: 'Professor',
}

export interface UseMyClassStudentsResult {
  students: UserSummary[]
  loading: boolean
  error: string
}

/**
 * Alunos das turmas do usuário autenticado (docente/representante —
 * RN-COM-PA02/PA03). Com `enabled: false` (personas de gestão) não busca nada.
 */
export function useMyClassStudents(enabled: boolean): UseMyClassStudentsResult {
  const [students, setStudents] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await listMyClassStudentsClient()
        if (cancelled) return
        setStudents(
          res.students.map((member) => ({
            id: member.id,
            name: member.name,
            ...(ROLE_LABELS[member.role] ? { role: ROLE_LABELS[member.role] } : {}),
          })),
        )
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar os alunos das suas turmas. Tente novamente.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { students, loading, error }
}
