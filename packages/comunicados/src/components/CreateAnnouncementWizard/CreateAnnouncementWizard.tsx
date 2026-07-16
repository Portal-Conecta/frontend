'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, ConfirmDialog, Icon, Text } from '@portal/ui'

import { ANNOUNCEMENT_ORIGIN } from '../../types/announcement'
import {
  useCreateAnnouncement,
  type CreateAnnouncementFormValues,
} from '../../hooks/useCreateAnnouncement'
import {
  AnnouncementContentStep,
  EMPTY_ANNOUNCEMENT_CONTENT,
  validateAnnouncementContent,
  type AnnouncementContentValue,
} from '../AnnouncementForm'
import { DestinationSelector } from '../DestinationSelector'
import type { Recipient } from '../DestinationSelector/types'
import { ScheduleDatePicker } from '../ScheduleDatePicker'
import { BRASILIA_TIMEZONE } from '../ScheduleDatePicker/datetime'
import { StepProgressBar } from '../StepProgressBar'
import { useDestinationCatalog } from '../../hooks/useDestinationCatalog'
import { mapRecipientsToPayload } from './mapRecipientsToPayload'

const STEPS = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'destinations', label: 'Destinatários' },
  { key: 'schedule', label: 'Publicação' },
] as const

function validateContent(content: AnnouncementContentValue) {
  return validateAnnouncementContent(content)
}

function buildFormValues(
  content: AnnouncementContentValue,
  recipients: Recipient[],
  scheduledFor: string | null,
): CreateAnnouncementFormValues {
  const { destinations, tagIds } = mapRecipientsToPayload(recipients)
  return {
    title: content.title,
    description: content.description,
    origin: ANNOUNCEMENT_ORIGIN.BOTH,
    destinations,
    tagIds,
    scheduledFor: scheduledFor ?? '',
    pinned: false,
  }
}

function formatScheduledForLabel(isoUtc: string): string {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return isoUtc

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRASILIA_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getPublishConfirmCopy(scheduledFor: string | null) {
  if (scheduledFor) {
    return {
      subTitle: 'Comunicados',
      title: 'Confirmar agendamento?',
      content: `O comunicado será publicado em ${formatScheduledForLabel(scheduledFor)} (horário de Brasília). Você pode editá-lo depois.`,
      labelConfirm: 'Agendar publicação',
    }
  }

  return {
    subTitle: 'Comunicados',
    title: 'Publicar comunicado?',
    content: 'O comunicado ficará visível para todos os destinatários agora. Você pode editá-lo depois.',
    labelConfirm: 'Publicar',
  }
}

/**
 * Wizard de criação de comunicado (#199): conteúdo → destinatários → publicar/agendar.
 */
export function CreateAnnouncementWizard() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [content, setContent] = useState<AnnouncementContentValue>(EMPTY_ANNOUNCEMENT_CONTENT)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [scheduledFor, setScheduledFor] = useState<string | null>(null)
  const [contentErrors, setContentErrors] = useState<Partial<Record<keyof AnnouncementContentValue, string>>>({})
  const [destinationsError, setDestinationsError] = useState<string | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { fieldErrors, formError, submitting, pendingImageUpload, publishFrom, scheduleFrom } =
    useCreateAnnouncement({
      redirectOnSuccess: false,
    })

  const step = STEPS[stepIndex]!.key
  // Só busca cursos/turmas/usuários quando o step de destinatários abre pela
  // primeira vez — evita o request no mount do wizard inteiro (issue #399).
  const catalog = useDestinationCatalog(step === 'destinations')
  const confirmCopy = getPublishConfirmCopy(scheduledFor)

  function handleNext() {
    if (step === 'content') {
      const errors = validateContent(content)
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
    setConfirmOpen(true)
  }

  function handleCloseConfirm() {
    if (submitting) return
    setConfirmOpen(false)
  }

  async function handleSubmit() {
    setConfirmOpen(false)

    const formValues = buildFormValues(content, recipients, scheduledFor)

    const submitOptions = { images: content.images }

    const created = scheduledFor
      ? await scheduleFrom({ ...formValues, scheduledFor }, submitOptions)
      : await publishFrom(formValues, submitOptions)

    if (created) {
      router.push('/comunicados')
    }
  }

  const scheduleError = fieldErrors.scheduledFor

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Link
        href="/comunicados"
        className="inline-flex w-fit items-center gap-2 rounded-sm text-interactive-default transition-colors hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
      >
        <Icon name="chevrons-left" size="sm" decorative />
        <Text as="span" variant="label-md-emphasis">
          Voltar para o mural
        </Text>
      </Link>

      <header className="flex flex-col gap-4">
        <Text as="h1" variant="heading-h2" tone="brand">
          Criar comunicado
        </Text>

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
            disabled={submitting || pendingImageUpload}
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
            // Com o post já criado (pendingImageUpload), voltar/editar não teria
            // efeito — o retry reenvia só as imagens. Navegação travada.
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={submitting || pendingImageUpload}
            >
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
              {pendingImageUpload
                ? 'Tentar enviar imagens novamente'
                : scheduledFor
                  ? 'Agendar publicação'
                  : 'Publicar agora'}
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
