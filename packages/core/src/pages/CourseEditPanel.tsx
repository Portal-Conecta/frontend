'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

import { Banner, Button, Icon, Input, Text, useFocusTrap } from '@portal/ui'

import { updateCourseClient } from '../courses/coursesClient'
import {
  MAX_CODE_LENGTH,
  MAX_NAME_LENGTH,
  parseUpdateCourse,
} from '../courses/coursesValidation'
import type { Course, UpdateCoursePayload } from '../courses/types'
import { HttpError } from '../http/errors'

export interface CourseEditPanelProps {
  course: Course
  open: boolean
  onClose: () => void
  onUpdated: (course: Course) => void
}

export function CourseEditPanel({ course, open, onClose, onUpdated }: CourseEditPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [code, setCode] = useState(course.code)
  const [name, setName] = useState(course.name)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestError, setRequestError] = useState('')
  const [saving, setSaving] = useState(false)

  useFocusTrap(panelRef, { active: open, onClose })

  useEffect(() => {
    if (!open) return
    setCode(course.code)
    setName(course.name)
    setErrors({})
    setRequestError('')
  }, [course, open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseUpdateCourse({ code, name })
    if (!parsed.ok) {
      setErrors(Object.fromEntries(parsed.errors.map((error) => [error.field, error.message])))
      return
    }

    const payload: UpdateCoursePayload = {}
    const nextCode = parsed.value.code
    const nextName = parsed.value.name
    if (nextCode !== undefined && nextCode !== course.code) payload.code = nextCode
    if (nextName !== undefined && nextName !== course.name) payload.name = nextName
    if (!payload.code && !payload.name) {
      onClose()
      return
    }

    setSaving(true)
    setErrors({})
    setRequestError('')
    try {
      const updated = await updateCourseClient(course.id, payload)
      onUpdated(updated)
      onClose()
    } catch (error) {
      if (error instanceof HttpError && error.kind === 'unauthorized') {
        window.location.assign('/login')
        return
      }
      setRequestError(
        error instanceof HttpError && error.body?.message
          ? error.body.message
          : 'Não foi possível editar o curso. Tente novamente.',
      )
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background-overlay"
        aria-label="Fechar edição do curso"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-background-surface p-6 shadow-lg focus-visible:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-default pb-4">
          <Text id={titleId} as="h2" variant="heading-h3" tone="brand">
            Editar Curso
          </Text>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="rounded-sm text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Icon name="x" size="md" decorative />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col pt-6">
          <div className="flex flex-col gap-5">
            {requestError ? <Banner variant="error">{requestError}</Banner> : null}
            <label className="flex flex-col gap-2">
              <Text as="span" variant="label-md-emphasis" tone="brand">
                Código
              </Text>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                maxLength={MAX_CODE_LENGTH}
                disabled={saving}
                {...(errors.code ? { error: errors.code } : {})}
              />
            </label>
            <label className="flex flex-col gap-2">
              <Text as="span" variant="label-md-emphasis" tone="brand">
                Nome
              </Text>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={MAX_NAME_LENGTH}
                disabled={saving}
                {...(errors.name ? { error: errors.name } : {})}
              />
            </label>
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <Button type="button" variant="outlined" fullWidth onClick={onClose} disabled={saving}>
              Descartar
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              Aplicar
            </Button>
          </div>
        </form>
      </aside>
    </div>,
    document.body,
  )
}
