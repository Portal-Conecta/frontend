'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, ConfirmDialog, Icon, Text } from '@portal/ui'
import { useCurrentUser } from '@portal/core'

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
import { DestinationSelector, type DestinationMode } from '../DestinationSelector'
import { addRecipient, makeRecipient, type Recipient } from '../DestinationSelector/types'
import { ScheduleDatePicker } from '../ScheduleDatePicker'
import { BRASILIA_TIMEZONE } from '../../utils/datetime'
import { StepProgressBar } from '../StepProgressBar'
import { useDestinationCatalog } from '../../hooks/useDestinationCatalog'
import { useMyClassStudents } from '../../hooks/useMyClassStudents'
import { mapRecipientsToPayload, type RecipientsPayload } from './mapRecipientsToPayload'

const STEPS = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'destinations', label: 'Destinatários' },
  { key: 'schedule', label: 'Publicação' },
] as const

/**
 * Modos de seleção por persona (RN-COM-PA02/PA03). Docente e representante não
 * têm "Selecionar usuários por tipo" (grupos amplos) nem acesso ao diretório
 * completo — só o próprio escopo de turmas/alunos.
 */
const ALL_MODES: readonly DestinationMode[] = ['filter', 'group', 'user']
const TEACHER_MODES: readonly DestinationMode[] = ['filter', 'user']
const REPRESENTATIVE_MODES: readonly DestinationMode[] = ['user']

function validateContent(content: AnnouncementContentValue) {
  return validateAnnouncementContent(content)
}

function buildFormValues(
  content: AnnouncementContentValue,
  mapped: Pick<RecipientsPayload, 'destinations' | 'tagIds' | 'shiftCodes' | 'roles'>,
  scheduledFor: string | null,
): CreateAnnouncementFormValues {
  return {
    title: content.title,
    description: content.description,
    origin: ANNOUNCEMENT_ORIGIN.BOTH,
    destinations: mapped.destinations,
    tagIds: mapped.tagIds,
    shiftCodes: mapped.shiftCodes,
    roles: mapped.roles,
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

  const user = useCurrentUser()
  const isTeacher = user?.userType === 'TEACHER'
  const isRepresentative = user?.userType === 'REPRESENTATIVE'
  const restricted = isTeacher || isRepresentative
  const modes = isTeacher ? TEACHER_MODES : isRepresentative ? REPRESENTATIVE_MODES : ALL_MODES

  const catalog = useDestinationCatalog({ includeDirectoryUsers: !restricted })
  const myStudents = useMyClassStudents(restricted)

  const myClassIds = useMemo(
    () => new Set((user?.classes ?? []).map((membership) => membership.classId)),
    [user],
  )

  /** Docente só enxerga as turmas em que leciona (claims do JWT). */
  const visibleClasses = useMemo(
    () =>
      restricted
        ? catalog.classes.filter((option) => myClassIds.has(option.value))
        : catalog.classes,
    [restricted, catalog.classes, myClassIds],
  )

  function handleSelectAllMyClasses() {
    let next = recipients
    for (const option of visibleClasses) {
      next = addRecipient(next, makeRecipient('class', option.value, option.label))
    }
    setRecipients(next)
  }

  function handleSelectAllMyStudents() {
    let next = recipients
    for (const student of myStudents.students) {
      next = addRecipient(next, makeRecipient('user', student.id, student.name))
    }
    setRecipients(next)
  }

  const step = STEPS[stepIndex]!.key
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
      const mapped = mapRecipientsToPayload(recipients, catalog.tags)
      if (mapped.errors.length > 0) {
        setDestinationsError(mapped.errors.join(' '))
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

  function clearUploadedLocalFile(localId: string) {
    setContent((previous) => ({
      ...previous,
      images: previous.images.map((item) =>
        item.id === localId
          ? { id: item.id, previewUrl: item.previewUrl, ...(item.name != null ? { name: item.name } : {}) }
          : item,
      ),
    }))
  }

  async function handleSubmit() {
    setConfirmOpen(false)

    const mapped = mapRecipientsToPayload(recipients, catalog.tags)
    if (mapped.errors.length > 0) {
      setDestinationsError(mapped.errors.join(' '))
      setStepIndex(1)
      return
    }

    const formValues = buildFormValues(content, mapped, scheduledFor)

    const submitOptions = {
      images: content.images,
      onImageUploaded: clearUploadedLocalFile,
    }

    const created = scheduledFor
      ? await scheduleFrom({ ...formValues, scheduledFor }, submitOptions)
      : await publishFrom(formValues, submitOptions)

    if (created) {
      // Soft-nav ao mural: o list do feed pode pegar 5xx transitório logo após
      // publish/upload. `refresh` invalida o cache RSC; o retry do usePostsList
      // cobre a listagem client.
      router.push('/comunicados')
      router.refresh()
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
          <>
            <DestinationSelector
              value={recipients}
              onChange={setRecipients}
              disabled={submitting}
              courses={restricted ? [] : catalog.courses}
              classes={visibleClasses}
              shifts={restricted ? [] : catalog.shifts}
              modes={modes}
              {...(restricted
                ? {
                    users: myStudents.students,
                    usersLoading: myStudents.loading,
                  }
                : {
                    usersPage: catalog.usersPage,
                    usersQuery: catalog.usersQuery,
                    onUsersQueryChange: catalog.setUsersQuery,
                    onUsersPageChange: catalog.setUsersPage,
                    usersLoading: catalog.usersLoading,
                  })}
              // Representante não tem modo com curso/turma — sem aviso de catálogo.
              catalogLoading={isRepresentative ? false : catalog.loading}
            />

            {isTeacher || isRepresentative ? (
              <div className="mt-6 flex flex-wrap gap-4">
                {isTeacher ? (
                  <Button
                    variant="outlined"
                    iconLeft="users"
                    onClick={handleSelectAllMyClasses}
                    disabled={submitting || catalog.loading || visibleClasses.length === 0}
                  >
                    Selecionar todas as minhas turmas
                  </Button>
                ) : null}
                {isRepresentative ? (
                  <Button
                    variant="outlined"
                    iconLeft="user"
                    onClick={handleSelectAllMyStudents}
                    disabled={submitting || myStudents.loading || myStudents.students.length === 0}
                  >
                    Selecionar todos os alunos da minha turma
                  </Button>
                ) : null}
              </div>
            ) : null}

            {myStudents.error ? (
              <Text as="p" variant="label-xs" className="mt-4 text-feedback-error">
                {myStudents.error}
              </Text>
            ) : null}
          </>
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
