'use client'

/**
 * CreateClassForm — formulário de criação de turma (Figma 2035:7027).
 *
 * Vive no `core` porque conhece contrato de domínio (curso, HubShift, payload
 * de criação) — ADR-0004: `@portal/ui` não pode carregar regra de negócio.
 *
 * Layout: coluna 2/3 com busca + lista de cursos (linha estilo `CourseRow`);
 * coluna 1/3 com número, turno (par de botões como `ShiftFilter`) e ações.
 * Após sucesso, a navegação fica no cliente (`router.push`) para não depender
 * de `redirect()` atravessar a fronteira server action → client como exceção.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { HUB_SHIFT, type HubShift } from '@portal/shared'
import { Button, ConfirmDialog, Field, Input, Text } from '@portal/ui'

import type { Course } from '../courses/types'
import type { CreateClassPayload } from './types'

export type CreateClassSubmitResult = {
  success: boolean
  error?: string
  /** `false` para erros permanentes (ex.: 403) — o modal não oferece "Tentar novamente". */
  retryable?: boolean
}

export interface CreateClassFormProps {
  courses: Course[]
  /** Quando a listagem falhou no server — distingue "vazio" de "erro de carga". */
  coursesLoadFailed?: boolean
  onSubmitClass: (data: CreateClassPayload) => Promise<CreateClassSubmitResult>
}

/**
 * Rótulos do protótipo (barra, não "e") — mesma cópia do `ShiftFilter` (#357).
 * O valor enviado ao BFF continua sendo o enum `HubShift`.
 */
const SHIFT_OPTIONS: readonly { shift: HubShift; label: string }[] = [
  { shift: HUB_SHIFT.FULL_AM_PM, label: 'Manhã/Tarde' },
  { shift: HUB_SHIFT.FULL_PM_NT, label: 'Tarde/Noite' },
]

function CourseIdentity({ course }: { course: Course }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <Text
        as="span"
        variant="label-md-emphasis"
        tone="brand"
        className="w-20 shrink-0 truncate border-r border-border-focus pr-3 text-left"
      >
        {course.code}
      </Text>
      <Text as="span" variant="label-md" tone="brand" className="min-w-0 truncate text-left">
        {course.name}
      </Text>
    </div>
  )
}

export function CreateClassForm({
  courses,
  coursesLoadFailed = false,
  onSubmitClass,
}: CreateClassFormProps) {
  const router = useRouter()

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [shift, setShift] = useState<HubShift | ''>('')
  const [courseSearch, setCourseSearch] = useState('')

  const [errors, setErrors] = useState<{ course?: boolean; classNumber?: boolean; shift?: boolean }>(
    {},
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [errorRetryable, setErrorRetryable] = useState(true)

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses
    const query = courseSearch.toLowerCase()
    return courses.filter(
      (course) =>
        course.code.toLowerCase().includes(query) || course.name.toLowerCase().includes(query),
    )
  }, [courses, courseSearch])

  const emptyListMessage = courseSearch.trim()
    ? `Nenhum curso encontrado para "${courseSearch}"`
    : coursesLoadFailed
      ? 'Não foi possível carregar os cursos.'
      : 'Ainda não há cursos cadastrados.'

  function validateForm() {
    const newErrors = {
      course: !selectedCourseId,
      classNumber: !classNumber.trim(),
      shift: !shift,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  async function handleSubmit() {
    if (!validateForm() || !shift) return

    const parsedNumber = Number(classNumber.trim())
    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      setErrors((prev) => ({ ...prev, classNumber: true }))
      return
    }

    setIsSubmitting(true)
    setShowErrorModal(false)
    setErrorMessage(undefined)
    setErrorRetryable(true)

    try {
      const response = await onSubmitClass({
        courseId: selectedCourseId,
        number: parsedNumber,
        shift,
      })

      if (response.success) {
        router.push('/turmas')
        return
      }

      setErrorMessage(response.error)
      setErrorRetryable(response.retryable !== false)
      setShowErrorModal(true)
      setIsSubmitting(false)
    } catch {
      setShowErrorModal(true)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-8 gap-y-6 pt-8 md:grid-cols-12">
        {/* Coluna do curso — ~2fr */}
        <div className="flex min-h-0 flex-col gap-6 md:col-span-8">
          <Field label="Curso">
            <Input
              placeholder="Todos"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
          </Field>

          <div
            role="radiogroup"
            aria-label="Curso"
            aria-invalid={errors.course || undefined}
            className="flex flex-col overflow-y-auto"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const selected = selectedCourseId === course.id
                return (
                  <button
                    key={course.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setSelectedCourseId(course.id)
                      setErrors((prev) => ({ ...prev, course: false }))
                    }}
                    className={[
                      'flex h-18 w-full items-center px-3 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2',
                      selected
                        ? 'rounded-md border border-interactive-pressed bg-interactive-subtle'
                        : 'border-b border-border-default bg-background-surface hover:border-interactive-default',
                    ].join(' ')}
                  >
                    <CourseIdentity course={course} />
                  </button>
                )
              })
            ) : (
              <div className="p-6 text-center text-text-secondary">{emptyListMessage}</div>
            )}
          </div>

          {errors.course ? (
            <Text variant="label-xs" className="text-feedback-error">
              Selecione um curso.
            </Text>
          ) : null}
        </div>

        {/* Coluna dos campos + ações — ~1fr */}
        <div className="flex flex-col justify-between gap-6 md:col-span-4">
          <div className="flex flex-col gap-6">
            <Field label="Número da Turma">
              <Input
                placeholder="Digitar"
                value={classNumber}
                onChange={(e) => {
                  setClassNumber(e.target.value)
                  setErrors((prev) => ({ ...prev, classNumber: false }))
                }}
                error={errors.classNumber ? 'Este campo é obrigatório' : ''}
              />
            </Field>

            <div className="flex flex-col gap-3">
              <Text as="p" variant="label-md-emphasis" tone="brand">
                Turno
              </Text>
              <div role="group" aria-label="Turno" className="flex items-center gap-3">
                {SHIFT_OPTIONS.map(({ shift: option, label }) => {
                  const active = shift === option
                  return (
                    <Button
                      key={option}
                      variant={active ? 'solid' : 'outlined'}
                      size="sm"
                      aria-pressed={active}
                      disabled={isSubmitting}
                      onClick={() => {
                        setShift(option)
                        setErrors((prev) => ({ ...prev, shift: false }))
                      }}
                      className="flex-1"
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
              {errors.shift ? (
                <Text variant="label-xs" className="text-feedback-error">
                  Este campo é obrigatório
                </Text>
              ) : null}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outlined"
              tone="brand"
              size="sm"
              onClick={() => router.push('/turmas')}
              disabled={isSubmitting}
              className="flex-1"
            >
              Descartar alterações
            </Button>
            <Button
              variant="solid"
              tone="brand"
              size="sm"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              Salvar e criar turma
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        subTitle=""
        title="Eita, algo não saiu como o esperado!"
        content={errorMessage ?? 'Estamos trabalhando nisso, tente novamente em breve.'}
        labelCancel="Fechar"
        labelConfirm={errorRetryable ? 'Tentar novamente' : 'Entendi'}
        confirmTone="brand"
        onConfirm={() => {
          setShowErrorModal(false)
          if (errorRetryable) void handleSubmit()
        }}
      />
    </div>
  )
}
