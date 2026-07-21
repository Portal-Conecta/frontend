import {
  ANNOUNCEMENT_STATUS,
  type AnnouncementDetail,
  type AnnouncementStatus,
  type AnnouncementUpdatePayload,
} from '../types/announcement'

export const MISSING_PUBLISHED_AT_AFTER_PUBLISH =
  'A publicação foi salva, mas a data de publicação ainda não veio do servidor. Atualize a página e tente novamente.'

/**
 * Após SCHEDULED → PUBLISHED, o back deve preencher `publishedAt`.
 * Bloqueia o fluxo de edição quando a resposta ainda vier sem esse campo (#397).
 */
export function assertPublishedAtAfterScheduleToPublish(
  previousStatus: AnnouncementStatus,
  payload: AnnouncementUpdatePayload,
  detail: AnnouncementDetail,
): void {
  const publishesNow =
    previousStatus === ANNOUNCEMENT_STATUS.SCHEDULED &&
    payload.status === ANNOUNCEMENT_STATUS.PUBLISHED

  if (!publishesNow) return

  if (!detail.announcement.publishedAt) {
    throw new Error(MISSING_PUBLISHED_AT_AFTER_PUBLISH)
  }
}
