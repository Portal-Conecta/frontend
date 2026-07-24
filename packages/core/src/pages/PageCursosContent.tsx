'use client'

/**
 * PageCursosContent — client boundary da lista de cursos (issue #357).
 *
 * Estado único `{ search, shift }` → uma chamada `listCoursesClient` (debounced)
 * ao BFF, que já resolve busca (nome OU código) e filtro de turno. A lista
 * inicial vem do SSR (`initialCourses`), então o primeiro render não refaz o
 * fetch — só mudanças de busca/filtro disparam nova busca.
 *
 * A navegação de "Adicionar novo curso" (`/cursos/novo`) e "Gerenciar"
 * (`/cursos/{id}`) aponta para telas de outras issues — a fiação já fica pronta.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { HttpError } from '../http/errors'
import { listCoursesClient } from '../courses/coursesClient'
import type { Course } from '../courses/types'
import { CourseRow } from '../courses/components/CourseRow'
import { CourseSearchField } from '../courses/components/CourseSearchField'
import { ShiftFilter } from '../courses/components/ShiftFilter'
import { Banner, Button, Text } from '@portal/ui'
import type { HubShift } from '@portal/shared'

const SEARCH_DEBOUNCE_MS = 300

export interface PageCursosContentProps {
  initialCourses: Course[]
  /** O SSR falhou ao carregar a lista inicial. */
  initialError?: boolean
}

export function PageCursosContent({ initialCourses, initialError = false }: PageCursosContentProps) {
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [shift, setShift] = useState<HubShift | null>(null)

  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  // Bump manual (botão "Tentar novamente") para re-disparar o fetch.
  const [reloadKey, setReloadKey] = useState(0)

  // Debounce só do texto — o filtro de turno aplica na hora.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search])

  // Pula o primeiro efeito quando o SSR já trouxe a lista (busca vazia, sem turno).
  // Se o SSR falhou, NÃO pula — refaz o fetch no cliente automaticamente.
  const isFirstRun = useRef(!initialError)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    listCoursesClient({
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(shift ? { shift } : {}),
    })
      .then((result) => {
        if (!cancelled) setCourses(result.courses)
      })
      .catch((err) => {
        if (cancelled) return
        // Sessão expirada: manda pro login, como as demais telas.
        if (err instanceof HttpError && err.kind === 'unauthorized') {
          router.replace('/login')
          return
        }
        setError(true)
        setCourses([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, shift, reloadKey, router])

  const hasActiveFilter = debouncedSearch.trim() !== '' || shift !== null

  // Estável (#497) — necessário para o React.memo de CourseRow surtir efeito:
  // sem useCallback, uma nova função a cada render quebraria a comparação rasa.
  const handleManage = useCallback(
    (course: Course) => router.push(`/cursos/${course.id}`),
    [router],
  )

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Cursos
        </Text>
        <div className="md:hidden">
          <Button
            size="sm"
            icon="plus"
            aria-label="Adicionar novo curso"
            onClick={() => router.push('/cursos/novo')}
          />
        </div>
        <div className="hidden md:block">
          <Button iconLeft="plus" onClick={() => router.push('/cursos/novo')}>
            Adicionar novo curso
          </Button>
        </div>
      </div>

      <CourseSearchField value={search} onChange={setSearch} />

      {/* Mobile: filtro acima da lista (empilhado). Desktop: lista 2fr | filtro 1fr. */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[2fr_1fr] md:items-start md:gap-8">
        <ShiftFilter value={shift} onChange={setShift} className="md:order-2" />

        <div className="min-w-0 md:order-1" aria-busy={loading}>
          {error ? (
            <div className="flex flex-col items-start gap-3">
              <Banner variant="error">Não foi possível carregar os cursos.</Banner>
              <Button variant="outlined" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col" role="status" aria-live="polite">
              <span className="sr-only">Carregando cursos...</span>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-18 animate-pulse border-b border-border-default" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-14 text-center">
              <Text as="p" variant="body-md" tone="secondary">
                {hasActiveFilter
                  ? 'Nenhum curso encontrado para a busca ou filtro selecionado.'
                  : 'Nenhum curso cadastrado ainda.'}
              </Text>
            </div>
          ) : (
            <ul className="flex flex-col">
              {courses.map((course) => (
                <li key={course.id}>
                  <CourseRow course={course} onManage={handleManage} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
