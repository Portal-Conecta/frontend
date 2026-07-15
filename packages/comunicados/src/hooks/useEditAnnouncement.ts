'use client'

import { useCallback, useState } from 'react'

import type { AnnouncementDetail, AnnouncementUpdatePayload } from '../types'
import {
  loadAnnouncementClient,
  rescheduleAnnouncementClient,
  updateAnnouncementClient,
} from '../services/client'
import { assertPublishedAtAfterScheduleToPublish } from '../utils/assertPublishTransition'

export interface UseEditAnnouncementResult {
  announcementId: string | null
  detail: AnnouncementDetail | null
  loading: boolean
  saving: boolean
  error: Error | null
  load: (id: string) => Promise<AnnouncementDetail>
  save: (payload: AnnouncementUpdatePayload) => Promise<AnnouncementDetail>
  reschedule: (scheduledFor: string) => Promise<AnnouncementDetail>
}

export function useEditAnnouncement(initialId?: string | null): UseEditAnnouncementResult {
  const [announcementId, setAnnouncementId] = useState<string | null>(initialId ?? null)
  const [detail, setDetail] = useState<AnnouncementDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async (id: string): Promise<AnnouncementDetail> => {
    setAnnouncementId(id)
    setLoading(true)
    setError(null)

    try {
      const result = await loadAnnouncementClient(id)
      setDetail(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Falha ao carregar comunicado'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const save = useCallback(async (payload: AnnouncementUpdatePayload): Promise<AnnouncementDetail> => {
    if (!announcementId) {
      throw new Error('Nenhum comunicado selecionado para salvar')
    }

    setSaving(true)
    setError(null)

    try {
      const previousStatus = detail?.announcement.status
      const result = await updateAnnouncementClient(announcementId, payload)
      if (previousStatus) {
        assertPublishedAtAfterScheduleToPublish(previousStatus, payload, result)
      }
      setDetail(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Falha ao salvar comunicado'))
      throw err
    } finally {
      setSaving(false)
    }
  }, [announcementId, detail])

  const reschedule = useCallback(async (scheduledFor: string): Promise<AnnouncementDetail> => {
    if (!announcementId) {
      throw new Error('Nenhum comunicado selecionado para reagendar')
    }

    setSaving(true)
    setError(null)

    try {
      const result = await rescheduleAnnouncementClient(announcementId, scheduledFor)
      setDetail(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Falha ao reagendar comunicado'))
      throw err
    } finally {
      setSaving(false)
    }
  }, [announcementId])

  return {
    announcementId,
    detail,
    loading,
    saving,
    error,
    load,
    save,
    reschedule,
  }
}
