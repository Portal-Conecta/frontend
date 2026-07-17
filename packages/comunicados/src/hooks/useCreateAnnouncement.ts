'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { ApiFieldError, HubShift } from '@portal/shared'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  ANNOUNCEMENT_ORIGIN,
  type AnnouncementOrigin,
  type AnnouncementResponse,
  type AnnouncementRole,
  type CreateAnnouncementDestinationInput,
  type PublishAnnouncementRequest,
  type ScheduleAnnouncementRequest,
} from '../types/announcement'

import type { FileUploadItem } from '@portal/ui'

import { uploadAnnouncementImagesClient } from '../services/client/announcementImagesClient'
import {
  sanitizePublishBody,
  sanitizeScheduleBody,
} from '../services/sanitizeAnnouncementRequest'

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
 * here, then o BFF presigna via API Gateway e envia ao S3 no servidor (#198). Set `redirectOnSuccess: false`
 * to own the navigation and only redirect after the uploads finish; by default it
 * redirects to `redirectTo` (the mural).
 *
 * Se o post for criado mas o upload de imagens falhar, o id fica em `pendingPost`
 * e a próxima submissão tenta só o upload — evita duplicar o comunicado no retry.
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
  shiftCodes: HubShift[]
  /** Papéis (`UserType`); vazio = sem restrição de papel no publish/schedule. */
  roles: AnnouncementRole[]
}

export interface SubmitAnnouncementOptions {
  /** Imagens locais a anexar após criar o comunicado (#198). */
  images?: readonly FileUploadItem[]
  /**
   * Chamado após cada upload OK — o wizard deve limpar `file` do item para o
   * retry não reenviar imagens já sincronizadas (#398).
   */
  onImageUploaded?: (localId: string) => void
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
  shiftCodes: [],
  roles: [],
}

const GENERIC_ERROR = 'Serviço indisponível, tente novamente.'
/** Mensagem quando o post já existe e só falta o sync de imagens (#398). */
export const PENDING_IMAGE_UPLOAD_ERROR =
  'Comunicado criado, mas não foi possível enviar as imagens. Tente novamente — só as imagens pendentes serão reenviadas.'

function messageFromApi(message: string | undefined, status: number): string {
  // FRÁGIL: o back ainda não envia `code` de erro — o match é pela frase exata.
  // Quebra se o texto/locale mudar; trocar por código quando o contrato expor.
  if (message === 'Data integrity violation.') {
    return 'O título excede o limite de 255 caracteres.'
  }
  if (message) return message
  return messageForStatus(status)
}

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
function mapFieldErrors(errors: ApiFieldError[]): Record<string, string> {
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
  errors?: ApiFieldError[]
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
  const [pendingPost, setPendingPost] = useState<AnnouncementResponse | null>(null)
  /** Ids locais já enviados com sucesso — retry pula estes (#398). */
  const uploadedLocalIdsRef = useRef(new Set<string>())

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
    setPendingPost(null)
    uploadedLocalIdsRef.current = new Set()
  }, [options.initialValues])

  const buildPublishBody = useCallback((): PublishAnnouncementRequest => {
    return buildPublishBodyFrom(values)
  }, [values])

  const uploadImages = useCallback(
    async (
      postId: string,
      images: readonly FileUploadItem[],
      onImageUploaded?: (localId: string) => void,
    ) => {
      const hasPending = images.some(
        (item) => Boolean(item.file) && !uploadedLocalIdsRef.current.has(item.id),
      )
      if (!hasPending) return true

      try {
        await uploadAnnouncementImagesClient(postId, images, {
          alreadyUploadedLocalIds: uploadedLocalIdsRef.current,
          markFirstAsThumbnail: uploadedLocalIdsRef.current.size === 0,
          onUploaded: (localId) => {
            uploadedLocalIdsRef.current.add(localId)
            onImageUploaded?.(localId)
          },
        })
        return true
      } catch {
        setFormError(PENDING_IMAGE_UPLOAD_ERROR)
        return false
      }
    },
    [],
  )

  const finishAfterImages = useCallback(
    async (
      post: AnnouncementResponse,
      images: readonly FileUploadItem[],
      onImageUploaded?: (localId: string) => void,
    ): Promise<AnnouncementResponse | null> => {
      const imagesOk = await uploadImages(post.id, images, onImageUploaded)
      if (!imagesOk) {
        setPendingPost(post)
        return null
      }

      setPendingPost(null)
      uploadedLocalIdsRef.current = new Set()
      if (redirectOnSuccess) {
        router.push(redirectTo)
      }
      return post
    },
    [redirectOnSuccess, redirectTo, router, uploadImages],
  )

  const send = useCallback(
    async (
      endpoint: 'publish' | 'schedule',
      body: PublishAnnouncementRequest | ScheduleAnnouncementRequest,
      options: SubmitAnnouncementOptions = {},
    ): Promise<AnnouncementResponse | null> => {
      setSubmitting(true)
      setFormError('')
      setFieldErrors({})

      try {
        if (pendingPost?.id) {
          return await finishAfterImages(
            pendingPost,
            options.images ?? [],
            options.onImageUploaded,
          )
        }

        const res = await fetch(`/api/comunicados/posts/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            endpoint === 'schedule'
              ? sanitizeScheduleBody(body as ScheduleAnnouncementRequest)
              : sanitizePublishBody(body),
          ),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as BffErrorBody | null
          const errors = data?.errors ?? []
          if (errors.length > 0) {
            setFieldErrors(mapFieldErrors(errors))
          } else {
            setFormError(messageFromApi(data?.message, res.status))
          }
          return null
        }

        const created = (await res.json().catch(() => null)) as AnnouncementResponse | null
        if (!created?.id) {
          setFormError(GENERIC_ERROR)
          return null
        }

        return await finishAfterImages(created, options.images ?? [], options.onImageUploaded)
      } catch {
        setFormError(GENERIC_ERROR)
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [finishAfterImages, pendingPost],
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

    return send('schedule', sanitizeScheduleBody({
      ...buildPublishBody(),
      scheduledFor: scheduledAt.toISOString(),
    }))
  }, [buildPublishBody, send, values.scheduledFor])

  const publishFrom = useCallback(
    (
      formValues: CreateAnnouncementFormValues,
      options: SubmitAnnouncementOptions = {},
    ): Promise<AnnouncementResponse | null> => {
      return send('publish', buildPublishBodyFrom(formValues), options)
    },
    [send],
  )

  const scheduleFrom = useCallback(
    (
      formValues: CreateAnnouncementFormValues,
      options: SubmitAnnouncementOptions = {},
    ): Promise<AnnouncementResponse | null> => {
      if (!formValues.scheduledFor) {
        setFieldErrors({ scheduledFor: 'Informe a data e a hora do agendamento.' })
        return Promise.resolve(null)
      }

      const scheduledAt = new Date(formValues.scheduledFor)
      if (Number.isNaN(scheduledAt.getTime())) {
        setFieldErrors({ scheduledFor: 'Data inválida.' })
        return Promise.resolve(null)
      }

      return send(
        'schedule',
        sanitizeScheduleBody({
          ...buildPublishBodyFrom(formValues),
          scheduledFor: scheduledAt.toISOString(),
        }),
        options,
      )
    },
    [send],
  )

  return {
    values,
    setField,
    reset,
    fieldErrors,
    formError,
    submitting,
    pendingImageUpload: pendingPost != null,
    publish,
    schedule,
    publishFrom,
    scheduleFrom,
  }
}

function buildPublishBodyFrom(values: CreateAnnouncementFormValues): PublishAnnouncementRequest {
  return sanitizePublishBody({
    title: values.title.trim(),
    description: values.description.trim(),
    origin: values.origin,
    destinations: values.destinations,
    pinned: values.pinned,
    tagIds: values.tagIds,
    shiftCodes: values.shiftCodes,
    roles: values.roles,
  })
}
