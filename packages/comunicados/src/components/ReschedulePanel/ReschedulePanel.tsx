'use client'

import { useState } from 'react'

import { Button, Text } from '@portal/ui'

import { ScheduleDatePicker } from '../ScheduleDatePicker'
import { rescheduleAnnouncementClient } from '../../services/client'

export interface ReschedulePanelProps {
  announcementId: string
  currentScheduledFor: string
  onSuccess?: (newScheduledFor: string) => void
}

export function ReschedulePanel({
  announcementId,
  currentScheduledFor,
  onSuccess,
}: ReschedulePanelProps) {
  const [scheduledFor, setScheduledFor] = useState<string | null>(currentScheduledFor)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    if (!scheduledFor) {
      setError('Selecione uma data e hora para reagendar.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await rescheduleAnnouncementClient(announcementId, scheduledFor)
      setSuccess(true)
      onSuccess?.(scheduledFor)
    } catch {
      setError('Não foi possível reagendar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Text as="h3" variant="label-sm-emphasis" tone="primary">
        Reagendar publicação
      </Text>

      <ScheduleDatePicker
        value={scheduledFor}
        onChange={setScheduledFor}
        error={error || undefined}
        disabled={saving}
      />

      {success && (
        <Text as="p" variant="body-sm" tone="secondary">
          Comunicado reagendado com sucesso.
        </Text>
      )}

      <Button onClick={handleSave} disabled={!scheduledFor || saving}>
        {saving ? 'Salvando…' : 'Salvar novo agendamento'}
      </Button>
    </div>
  )
}