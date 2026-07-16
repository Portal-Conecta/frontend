import { HUB_SHIFT, type HubShift } from '@portal/shared'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  type CreateAnnouncementDestinationInput,
  type PublishAnnouncementRequest,
  type ScheduleAnnouncementRequest,
} from '../types/announcement'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const HUB_SHIFT_VALUES = new Set<string>(Object.values(HUB_SHIFT))

/**
 * Indica se o valor é um UUID (versões 1–8, contrato de `tagIds` e
 * `referenceId` no back — o serviço valida formato, não versão específica).
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function isHubShiftCode(value: string): value is HubShift {
  return HUB_SHIFT_VALUES.has(value)
}

function sanitizeDestination(
  destination: CreateAnnouncementDestinationInput,
): CreateAnnouncementDestinationInput | null {
  if (destination.type === ANNOUNCEMENT_DESTINATION_TYPE.GENERAL) {
    return { type: destination.type }
  }

  const referenceId = destination.referenceId?.trim()
  if (!referenceId || !isUuid(referenceId)) {
    return null
  }

  return { type: destination.type, referenceId }
}

/**
 * Alinha o body ao OpenAPI (`PublishAnnouncementRequest` / `ScheduleAnnouncementRequest`):
 * `referenceId` e itens de `tagIds` precisam ser UUID; `shiftCodes` só aceita o enum
 * do Core; campos opcionais vazios são omitidos.
 */
export function sanitizePublishBody(body: PublishAnnouncementRequest): PublishAnnouncementRequest {
  const destinations = body.destinations
    .map(sanitizeDestination)
    .filter((destination): destination is CreateAnnouncementDestinationInput => destination !== null)

  const safeDestinations =
    destinations.length > 0
      ? destinations
      : [{ type: ANNOUNCEMENT_DESTINATION_TYPE.GENERAL }]

  const tagIds = (body.tagIds ?? []).filter(isUuid)
  const shiftCodes = (body.shiftCodes ?? []).filter(isHubShiftCode)

  const sanitized: PublishAnnouncementRequest = {
    title: body.title,
    description: body.description,
    origin: body.origin,
    destinations: safeDestinations,
  }

  if (body.pinned === true) {
    sanitized.pinned = true
  }

  if (tagIds.length > 0) {
    sanitized.tagIds = tagIds
  }

  if (shiftCodes.length > 0) {
    sanitized.shiftCodes = shiftCodes
  }

  return sanitized
}

export function sanitizeScheduleBody(body: ScheduleAnnouncementRequest): ScheduleAnnouncementRequest {
  return {
    ...sanitizePublishBody(body),
    scheduledFor: body.scheduledFor,
  }
}
