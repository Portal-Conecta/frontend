'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  ANNOUNCEMENT_ORIGIN,
  type AnnouncementOrigin,
  type AnnouncementResponse,
  type CreateAnnouncementDestinationInput,
  type FieldErrorDetail,
  type PublishAnnouncementRequest,
  type ScheduleAnnouncementRequest,
} from '../types/announcement'

/**
 * useCreateAnnouncement — form state + submit for creating an announcement,
 * either published immediately (`publish`) or scheduled for the future
 * (`schedule`). Consumed by the create-announcement page (#197).
 *
 * Talks only to the same-origin BFF (`/api/comunicados/posts/*`); the JWT stays
 * server-side. On a 400, the back's `errors[]` are mapped to `fieldErrors` keyed
 * by field name so the form can render each message inline.
 *
 * `publish`/`schedule` resolve to the created `AnnouncementResponse` (or `null`
 * on failure), so the caller can chain the 2-phase create flow: create the post
 * here, then upload images to `/api/comunicados/posts/{id}/images` (#198). Set
 * `redirectOnSuccess: false` to own the navigation and only redirect after the
 * uploads finish; by default it redirects to `redirectTo` (the mural).
 */

export interface CreateAnnouncementFormValues {
  title: string
  description: string
  origin: AnnouncementOrigin
  destinations: CreateAnnouncementDestinationInput[]
  /** Local datetime-ish string; converted to an ISO instant on schedule. */
  scheduledFor: string
  pinned: boolean
  tagIds: string[]
}

export interface UseCreateAnnouncementOptions {
  redirectTo?: string
  /** When true (default), navigates to `redirectTo` right after a successful create. */
  redirectOnSuccess?: boolean
  initialValues?: Partial<CreateAnnouncementFormValues>
}

const DEFAULT_VALUES: CreateAnnouncementFormValues = {
  title: '',
  description: '',
  origin: ANNOUNCEMENT_ORIGIN.BOTH,
  destinations: [{ type: ANNOUNCEMENT_DESTINATION_TYPE.GENERAL }],
  scheduledFor: '',
  pinned: false,
  tagIds: [],
}

const GENERIC_ERROR = 'Serviço indisponível, tente novamente.'

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Sua sessão expirou. Faça login novamente.'
    case 403:
      return 'Você não tem permissão para criar este comunicado.'
    default:
      return GENERIC_ERROR
  }
}

/** Base segment of a field path: `destinations[0].type` → `destinations`. */
function baseField(field: string): string {
  const match = /^[^.[]+/.exec(field)
  return match ? match[0] : field
}

/**
 * Turns the back's `errors[]` into a `{ field: message }` map. The full path is
 * kept (so a form can target `destinations[0].type`) and the base segment is
 * filled as a fallback (so a simpler form can target `destinations`).
 */
function mapFieldErrors(errors: FieldErrorDetail[]): Record<string, string> {
  const mapped: Record<string, string> = {}
  for (const { field, message } of errors) {
    if (!(field in mapped)) {
      mapped[field] = message
    }
    const base = baseField(field)
    if (!(base in mapped)) {
      mapped[base] = message
    }
  }
  return mapped
}

interface BffErrorBody {
  code?: string
  message?: string
  errors?: FieldErrorDetail[]
}

export function useCreateAnnouncement(options: UseCreateAnnouncementOptions = {}) {
  const router = useRouter()
  const redirectTo = options.redirectTo ?? '/comunicados'
  const redirectOnSuccess = options.redirectOnSuccess ?? true

  const [values, setValues] = useState<CreateAnnouncementFormValues>({
    ...DEFAULT_VALUES,
    ...options.initialValues,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback(
    <K extends keyof CreateAnnouncementFormValues>(
      field: K,
      value: CreateAnnouncementFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => {
        if (!(field in prev)) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    [],
  )

  const reset = useCallback(() => {
    setValues({ ...DEFAULT_VALUES, ...options.initialValues })
    setFieldErrors({})
    setFormError('')
  }, [options.initialValues])

  const buildPublishBody = useCallback((): PublishAnnouncementRequest => {
    return {
      title: values.title.trim(),
      description: values.description.trim(),
      origin: values.origin,
      destinations: values.destinations,
      pinned: values.pinned,
      tagIds: values.tagIds,
    }
  }, [values])

  const send = useCallback(
    async (
      endpoint: 'publish' | 'schedule',
      body: PublishAnnouncementRequest | ScheduleAnnouncementRequest,
    ): Promise<AnnouncementResponse | null> => {
      setSubmitting(true)
      setFormError('')
      setFieldErrors({})

      try {
        const res = await fetch(`/api/comunicados/posts/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const created = (await res.json().catch(() => null)) as AnnouncementResponse | null
          if (redirectOnSuccess) {
            router.push(redirectTo)
          }
          return created
        }

        const data = (await res.json().catch(() => null)) as BffErrorBody | null
        const errors = data?.errors ?? []
        if (errors.length > 0) {
          setFieldErrors(mapFieldErrors(errors))
        } else {
          setFormError(data?.message ?? messageForStatus(res.status))
        }
        return null
      } catch {
        setFormError(GENERIC_ERROR)
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [redirectOnSuccess, redirectTo, router],
  )

  const publish = useCallback((): Promise<AnnouncementResponse | null> => {
    return send('publish', buildPublishBody())
  }, [buildPublishBody, send])

  const schedule = useCallback((): Promise<AnnouncementResponse | null> => {
    if (!values.scheduledFor) {
      setFieldErrors({ scheduledFor: 'Informe a data e a hora do agendamento.' })
      return Promise.resolve(null)
    }

    const scheduledAt = new Date(values.scheduledFor)
    if (Number.isNaN(scheduledAt.getTime())) {
      setFieldErrors({ scheduledFor: 'Data inválida.' })
      return Promise.resolve(null)
    }

    return send('schedule', {
      ...buildPublishBody(),
      scheduledFor: scheduledAt.toISOString(),
    })
  }, [buildPublishBody, send, values.scheduledFor])

  return {
    values,
    setField,
    reset,
    fieldErrors,
    formError,
    submitting,
    publish,
    schedule,
  }
}
