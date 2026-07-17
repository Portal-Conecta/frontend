'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, ConfirmDialog, Icon, Text } from '@portal/ui'
import { HttpError } from '@portal/core/http/errors'

import type { AnnouncementStatus } from '../../types/announcement'
import { ANNOUNCEMENT_STATUS } from '../../types/announcement'
import { useEditAnnouncement } from '../../hooks/useEditAnnouncement'
import { useDestinationCatalog } from '../../hooks/useDestinationCatalog'
import {
  deleteAnnouncementImageClient,
  uploadAnnouncementImagesClient,
} from '../../services/client/announcementImagesClient'
import { getDestinationUserClient } from '../../services/client/destinationsClient'
import { listTagsClient } from '../../services/client/tagsClient'
import {
  AnnouncementContentStep,
  EMPTY_ANNOUNCEMENT_CONTENT,
  validateAnnouncementContent,
  type AnnouncementContentValue,
} from '../AnnouncementForm'
import { DestinationSelector } from '../DestinationSelector'
import type { Recipient } from '../DestinationSelector/types'
import { EditBlockedFieldsHint } from '../EditBlockedFieldsHint'
import { ScheduleDatePicker } from '../ScheduleDatePicker'
import { BRASILIA_TIMEZONE } from '../ScheduleDatePicker/datetime'
import { StepProgressBar } from '../StepProgressBar'
import {
  buildDestinationsFromRecipients,
  buildEditUpdatePayload,
  hasLocalImageFiles,
  hasRemainingRemoteImages,
  listUserIdsNeedingLabel,
  mapDetailToEditForm,
  resolveRecipientLabels,
  resolveRemovedImageIds,
} from './mapAnnouncementDetailToForm'

const STEPS = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'destinations', label: 'Destinatários' },
  { key: 'schedule', label: 'Publicação' },
] as const

const GENERIC_ERROR = 'Serviço indisponível, tente novamente.'
const IMAGE_SYNC_ERROR =
  'Alterações salvas, mas não foi possível sincronizar as imagens. Tente novamente.'

function formatScheduledForLabel(isoUtc: string): string {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return isoUtc

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRASILIA_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getSaveConfirmCopy(args: {
  currentStatus: AnnouncementStatus
  scheduledFor: string | null
}) {
  const { currentStatus, scheduledFor } = args

  if (scheduledFor) {
    const when = formatScheduledForLabel(scheduledFor)
    if (currentStatus === ANNOUNCEMENT_STATUS.PUBLISHED) {
      return {
        subTitle: 'Comunicados',
        title: 'Agendar comunicado?',
        content: `O comunicado deixará de ficar publicado agora e será agendado para ${when} (horário de Brasília).`,
        labelConfirm: 'Agendar publicação',
      }
    }

    return {
      subTitle: 'Comunicados',
      title: 'Confirmar reagendamento?',
      content: `O comunicado será publicado em ${when} (horário de Brasília).`,
      labelConfirm: 'Salvar agendamento',
    }
  }

  if (currentStatus === ANNOUNCEMENT_STATUS.SCHEDULED) {
    return {
      subTitle: 'Comunicados',
      title: 'Publicar comunicado agora?',
      content:
        'O comunicado deixará de estar agendado e ficará visível para os destinatários imediatamente.',
      labelConfirm: 'Publicar agora',
    }
  }

  return {
    subTitle: 'Comunicados',
    title: 'Salvar alterações?',
    content: 'As alterações do comunicado serão aplicadas para todos os destinatários.',
    labelConfirm: 'Salvar',
  }
}

function messageFromHttpError(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.kind === 'forbidden') {
      return 'Você não tem permissão para editar este comunicado.'
    }
    if (err.kind === 'not_found') {
      return 'Comunicado não encontrado.'
    }
    if (err.status === 409) {
      return 'Este comunicado não pode ser editado no estado atual.'
    }
    const apiMessage = err.body?.message
    if (apiMessage) return apiMessage
  }
  if (err instanceof Error && err.message && err.message !== err.name) {
    return err.message
  }
  return GENERIC_ERROR
}

export interface EditAnnouncementWizardProps {
  announcementId: string
}

/**
 * Wizard de edição de comunicado (#205): conteúdo → destinatários → publicação.
 * Reusa as mesmas etapas do criar; na última etapa:
 * - SCHEDULED: altera data/hora ou publica agora
 * - PUBLISHED: pode agendar uma nova data
 */
export function EditAnnouncementWizard({ announcementId }: EditAnnouncementWizardProps) {
  const router = useRouter()

  const [stepIndex, setStepIndex] = useState(0)
  const [content, setContent] = useState<AnnouncementContentValue>(EMPTY_ANNOUNCEMENT_CONTENT)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [scheduledFor, setScheduledFor] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<AnnouncementStatus>(
    ANNOUNCEMENT_STATUS.PUBLISHED,
  )
  const [initialImageIds, setInitialImageIds] = useState<string[]>([])
  const [contentErrors, setContentErrors] = useState<
    Partial<Record<keyof AnnouncementContentValue, string>>
  >({})
  const [destinationsError, setDestinationsError] = useState<string | undefined>()
  const [scheduleError, setScheduleError] = useState<string | undefined>()
  const [formError, setFormError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Só monta o RichTextEditor depois do map — senão o TipTap inicia vazio
  // (`content` no useEditor) e a descrição não aparece na UI.
  const [formReady, setFormReady] = useState(false)

  const { detail, error, load, save, reschedule } = useEditAnnouncement(announcementId)
  const catalog = useDestinationCatalog()
  const fetchedUserIds = useRef(new Set<string>())

  useEffect(() => {
    setFormReady(false)
    fetchedUserIds.current.clear()
    void load(announcementId).catch(() => {
      // erro já fica em `error` do hook
    })
  }, [announcementId, load])

  // Hidrata o form só depois de resolver nomes (curso/turma/usuário) — evita chips com "Usuário"/UUID.
  useEffect(() => {
    if (!detail || formReady || catalog.loading) return

    let cancelled = false

    void (async () => {
      const mapped = mapDetailToEditForm(detail)

      const tagsByHubEntityId = new Map<string, string>()
      try {
        const tags = await listTagsClient()
        for (const tag of tags) {
          const hubId = tag.hubEntityId?.trim()
          if (hubId) tagsByHubEntityId.set(hubId, tag.name)
        }
      } catch {
        // catálogo Hub abaixo ainda tenta resolver curso/turma
      }

      const userIds = listUserIdsNeedingLabel(mapped.recipients)
      const userLabels = new Map<string, string>()
      await Promise.all(
        userIds.map(async (userId) => {
          fetchedUserIds.current.add(userId)
          try {
            const user = await getDestinationUserClient(userId)
            if (user.name?.trim()) userLabels.set(userId, user.name.trim())
          } catch {
            // mantém fallback "Usuário"
          }
        }),
      )

      if (cancelled) return

      const recipients = resolveRecipientLabels({
        recipients: mapped.recipients,
        courses: catalog.courses,
        classes: catalog.classes,
        tagsByHubEntityId,
        userLabels,
      })

      setContent(mapped.content)
      setRecipients(recipients)
      setScheduledFor(mapped.scheduledFor)
      setCurrentStatus(mapped.status)
      setInitialImageIds(mapped.initialImageIds)
      setFormReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [detail, formReady, catalog.loading, catalog.courses, catalog.classes])

  const step = STEPS[stepIndex]!.key
  const confirmCopy = getSaveConfirmCopy({ currentStatus, scheduledFor })
  const isPublished = currentStatus === ANNOUNCEMENT_STATUS.PUBLISHED

  function handleNext() {
    if (step === 'content') {
      const errors = validateAnnouncementContent(content)
      if (Object.keys(errors).length > 0) {
        setContentErrors(errors)
        return
      }
      setContentErrors({})
    }

    if (step === 'destinations') {
      if (recipients.length === 0) {
        setDestinationsError('Selecione ao menos um destinatário.')
        return
      }
      setDestinationsError(undefined)
    }

    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function handleBack() {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  function handleOpenConfirm() {
    if (submitting) return

    if (scheduledFor) {
      const scheduledAt = new Date(scheduledFor)
      if (Number.isNaN(scheduledAt.getTime())) {
        setScheduleError('Data inválida.')
        return
      }
      if (scheduledAt.getTime() <= Date.now()) {
        setScheduleError('Escolha uma data e hora futuras.')
        return
      }
    }

    setScheduleError(undefined)
    setConfirmOpen(true)
  }

  function handleCloseConfirm() {
    if (submitting) return
    setConfirmOpen(false)
  }

  async function syncImages(postId: string): Promise<boolean> {
    const removedIds = resolveRemovedImageIds(initialImageIds, content.images)

    try {
      for (const imageId of removedIds) {
        await deleteAnnouncementImageClient(postId, imageId)
      }

      if (hasLocalImageFiles(content.images)) {
        await uploadAnnouncementImagesClient(postId, content.images, {
          markFirstAsThumbnail: !hasRemainingRemoteImages(content.images),
        })
      }

      return true
    } catch {
      setFormError(IMAGE_SYNC_ERROR)
      return false
    }
  }

  async function handleSubmit() {
    setConfirmOpen(false)
    setSubmitting(true)
    setFormError('')
    setScheduleError(undefined)

    const destinations = buildDestinationsFromRecipients(recipients)
    const payload = buildEditUpdatePayload({
      title: content.title,
      description: content.description,
      destinations,
      currentStatus,
      scheduledFor,
    })

    const wantsScheduled =
      Boolean(scheduledFor) && currentStatus === ANNOUNCEMENT_STATUS.PUBLISHED
    const wantsPublishedNow =
      scheduledFor == null && currentStatus === ANNOUNCEMENT_STATUS.SCHEDULED

    try {
      const dateChanged =
        Boolean(scheduledFor) && detail?.announcement.scheduledFor !== scheduledFor

      if (currentStatus === ANNOUNCEMENT_STATUS.SCHEDULED && scheduledFor) {
        // Conteúdo/destinos via PUT; data via PATCH dedicado (só SCHEDULED).
        await save({
          title: content.title.trim(),
          description: content.description.trim(),
          destinations,
        })
        if (dateChanged) {
          await reschedule(scheduledFor)
        }
      } else {
        let updated = await save(payload)

        // Confirma transição de status (publicado → agendado some do mural).
        if (wantsScheduled && updated.announcement.status !== ANNOUNCEMENT_STATUS.SCHEDULED) {
          if (!scheduledFor) {
            throw new Error(
              'Não foi possível agendar o comunicado. Ele continua publicado no mural.',
            )
          }
          updated = await save({
            status: ANNOUNCEMENT_STATUS.SCHEDULED,
            scheduledFor,
          })
          if (updated.announcement.status !== ANNOUNCEMENT_STATUS.SCHEDULED) {
            throw new Error(
              'Não foi possível agendar o comunicado. Ele continua publicado no mural.',
            )
          }
        }

        if (wantsPublishedNow && updated.announcement.status !== ANNOUNCEMENT_STATUS.PUBLISHED) {
          throw new Error('Não foi possível publicar o comunicado agora. Tente novamente.')
        }
      }

      const imagesOk = await syncImages(announcementId)
      if (!imagesOk) {
        return
      }

      // `/comunicados/meus` busca os próprios dados via `useMyAnnouncements`
      // (client-side, sem RSC/cache de servidor) — `router.refresh()` depois
      // do `push` só duplicaria o fetch à toa (#399).
      router.push('/comunicados/meus')
    } catch (err) {
      setFormError(messageFromHttpError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !detail && !formReady) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href="/comunicados/meus"
          className="inline-flex w-fit items-center gap-2 rounded-sm text-interactive-default transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
        >
          <Icon name="chevrons-left" size="sm" decorative />
          <Text as="span" variant="label-md-emphasis">
            Voltar para meus comunicados
          </Text>
        </Link>
        <div
          role="alert"
          className="flex items-stretch gap-4 rounded-md border-sm border-feedback-error/20 bg-feedback-error/5 p-4"
        >
          <span className="w-[3px] shrink-0 rounded-full bg-feedback-error" aria-hidden="true" />
          <Text variant="label-md" className="text-feedback-error">
            {messageFromHttpError(error)}
          </Text>
        </div>
      </div>
    )
  }

  if (!formReady) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-8">
        <Text as="p" variant="body-md" tone="secondary">
          Carregando comunicado…
        </Text>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Link
        href="/comunicados/meus"
        className="inline-flex w-fit items-center gap-2 rounded-sm text-interactive-default transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
      >
        <Icon name="chevrons-left" size="sm" decorative />
        <Text as="span" variant="label-md-emphasis">
          Voltar para meus comunicados
        </Text>
      </Link>

      <header className="flex flex-col gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Editar comunicado
        </Text>
        <EditBlockedFieldsHint blocked={isPublished} />
      </header>

      <div className="rounded-md border-sm border-border-default bg-background-surface p-6 md:p-8">
        {step === 'content' ? (
          <AnnouncementContentStep
            value={content}
            onChange={setContent}
            errors={contentErrors}
            disabled={submitting}
          />
        ) : null}

        {step === 'destinations' ? (
          <DestinationSelector
            value={recipients}
            onChange={setRecipients}
            disabled={submitting}
            courses={catalog.courses}
            classes={catalog.classes}
            shifts={catalog.shifts}
            usersPage={catalog.usersPage}
            usersQuery={catalog.usersQuery}
            onUsersQueryChange={catalog.setUsersQuery}
            onUsersPageChange={catalog.setUsersPage}
            usersLoading={catalog.usersLoading}
            catalogLoading={catalog.loading}
          />
        ) : null}

        {step === 'destinations' && destinationsError ? (
          <Text as="p" variant="label-xs" className="mt-4 text-feedback-error">
            {destinationsError}
          </Text>
        ) : null}

        {step === 'schedule' ? (
          <ScheduleDatePicker
            value={scheduledFor}
            onChange={setScheduledFor}
            disabled={submitting}
            {...(scheduleError ? { error: scheduleError } : {})}
          />
        ) : null}
      </div>

      {formError ? (
        <div
          role="alert"
          className="flex items-stretch gap-4 rounded-md border-sm border-feedback-error/20 bg-feedback-error/5 p-4"
        >
          <span className="w-[3px] shrink-0 rounded-full bg-feedback-error" aria-hidden="true" />
          <Text variant="label-md" className="text-feedback-error">
            {formError}
          </Text>
        </div>
      ) : null}
      {catalog.error ? (
        <div
          role="alert"
          className="flex items-stretch gap-4 rounded-md border-sm border-feedback-error/20 bg-feedback-error/5 p-4"
        >
          <span className="w-[3px] shrink-0 rounded-full bg-feedback-error" aria-hidden="true" />
          <Text variant="label-md" className="text-feedback-error">
            {catalog.error}
          </Text>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {stepIndex > 0 ? (
            <Button variant="outlined" onClick={handleBack} disabled={submitting}>
              Voltar
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-4">
          {step !== 'schedule' ? (
            <Button onClick={handleNext} disabled={submitting}>
              Avançar
            </Button>
          ) : (
            <Button onClick={handleOpenConfirm} loading={submitting}>
              {scheduledFor ? 'Salvar agendamento' : isPublished ? 'Salvar alterações' : 'Publicar agora'}
            </Button>
          )}
        </div>
        <StepProgressBar
          totalSteps={STEPS.length}
          currentStep={stepIndex}
          labels={STEPS.map((item) => item.label)}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={() => {
          void handleSubmit()
        }}
        subTitle={confirmCopy.subTitle}
        title={confirmCopy.title}
        content={confirmCopy.content}
        labelCancel="Cancelar"
        labelConfirm={confirmCopy.labelConfirm}
        confirmTone="brand"
      />
    </div>
  )
}
