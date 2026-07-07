'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Alert, Button, Icon, Text } from '@portal/ui'

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

  const { fieldErrors, formError, submitting, publishFrom, scheduleFrom } = useCreateAnnouncement({
    redirectOnSuccess: false,
  })

  const catalog = useDestinationCatalog()

  const step = STEPS[stepIndex]!.key

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

  async function handleSubmit() {
    const formValues = buildFormValues(content, recipients, scheduledFor)

    const created = scheduledFor
      ? await scheduleFrom({ ...formValues, scheduledFor })
      : await publishFrom(formValues)

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
            disabled={submitting}
            {...(scheduleError ? { error: scheduleError } : {})}
          />
        ) : null}
      </div>

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {catalog.error ? <Alert variant="error">{catalog.error}</Alert> : null}

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
            <Button onClick={handleSubmit} loading={submitting}>
              {scheduledFor ? 'Agendar publicação' : 'Publicar agora'}
            </Button>
          )}
        </div>
        <StepProgressBar
          totalSteps={STEPS.length}
          currentStep={stepIndex}
          labels={STEPS.map((item) => item.label)}
        />
      </div>
    </div>
  )
}
