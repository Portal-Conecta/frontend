import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  type CreateAnnouncementDestinationInput,
} from '../../types/announcement'

import type { Recipient } from '../DestinationSelector/types'

export interface RecipientsPayload {
  destinations: CreateAnnouncementDestinationInput[]
  tagIds: string[]
}

/**
 * Reduz o `Recipient[]` expressivo (#195) ao contrato de publicação do back:
 * `destinations[]` + `tagIds[]` (tags de curso/turma/turno vinculadas na criação).
 */
export function mapRecipientsToPayload(recipients: readonly Recipient[]): RecipientsPayload {
  const destinations: CreateAnnouncementDestinationInput[] = []
  const tagIds: string[] = []
  const destKeys = new Set<string>()
  const tagSet = new Set<string>()

  function addDestination(type: CreateAnnouncementDestinationInput['type'], referenceId?: string) {
    const key = referenceId ? `${type}:${referenceId}` : type
    if (destKeys.has(key)) return
    destKeys.add(key)
    destinations.push(referenceId ? { type, referenceId } : { type })
  }

  function addTag(tagId: string) {
    if (!tagSet.has(tagId)) {
      tagSet.add(tagId)
      tagIds.push(tagId)
    }
  }

  for (const recipient of recipients) {
    switch (recipient.kind) {
      case 'course':
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.COURSE, recipient.refId)
        addTag(recipient.refId)
        break
      case 'class':
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.CLASS, recipient.refId)
        addTag(recipient.refId)
        break
      case 'shift':
        addTag(recipient.refId)
        break
      case 'user':
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.USER, recipient.refId)
        break
      case 'group':
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.GENERAL)
        break
    }
  }

  if (destinations.length === 0) {
    addDestination(ANNOUNCEMENT_DESTINATION_TYPE.GENERAL)
  }

  return { destinations, tagIds }
}
