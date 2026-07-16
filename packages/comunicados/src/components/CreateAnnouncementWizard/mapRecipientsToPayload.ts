import { HUB_SHIFT, type HubShift } from '@portal/shared'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  ANNOUNCEMENT_ROLE,
  type AnnouncementRole,
  type CreateAnnouncementDestinationInput,
} from '../../types/announcement'
import type { Tag } from '../../types/tag'
import { findTagIdByHubEntity } from '../../utils/muralFilters'

import type { Recipient, RecipientGroup } from '../DestinationSelector/types'

export interface RecipientsPayload {
  destinations: CreateAnnouncementDestinationInput[]
  /** UUIDs internos `tag.id` (COURSE/CLASS) — nunca `hub_entity_id`. */
  tagIds: string[]
  /** Enums `Shift` do Core (`FULL_AM_PM` / `FULL_PM_NT`). */
  shiftCodes: HubShift[]
  /**
   * Papéis (`UserType`) enviados em `roles` no publish/schedule.
   * Vazio = sem restrição de papel (GENERAL sozinho = broadcast a todos).
   */
  roles: AnnouncementRole[]
  /** Mensagens de campo quando algum destinatário não pôde ser mapeado. */
  errors: string[]
}

const HUB_SHIFT_VALUES = new Set<string>(Object.values(HUB_SHIFT))

/** UI `RecipientGroup` → enum `UserType` do back. */
const GROUP_TO_ROLE: Record<RecipientGroup, AnnouncementRole> = {
  STUDENTS: ANNOUNCEMENT_ROLE.STUDENT,
  TEACHERS: ANNOUNCEMENT_ROLE.TEACHER,
  REPRESENTATIVES: ANNOUNCEMENT_ROLE.REPRESENTATIVE,
}

function isHubShift(value: string): value is HubShift {
  return HUB_SHIFT_VALUES.has(value)
}

function isRecipientGroup(value: string): value is RecipientGroup {
  return value in GROUP_TO_ROLE
}

/**
 * Reduz o `Recipient[]` expressivo (#195) ao contrato de publicação do back:
 * `destinations[]` + `tagIds[]` + `shiftCodes[]` + `roles[]`.
 *
 * Destinos = escopo espacial (GENERAL/COURSE/CLASS/USER).
 * `roles` = restrição de papel (tag ROLE). Grupos da UI (`STUDENTS`/`TEACHERS`/
 * `REPRESENTATIVES`) só contribuem para `roles` — GENERAL só entra como fallback
 * quando não há destino espacial (curso/turma/usuário).
 *
 * Turnos vão em `shiftCodes` (não em `tagIds`). Curso/turma resolvem `tag.id`
 * via catálogo (`findTagIdByHubEntity`) — o `referenceId` do destino continua
 * sendo o id Hub.
 */
export function mapRecipientsToPayload(
  recipients: readonly Recipient[],
  tags: readonly Tag[] = [],
): RecipientsPayload {
  const destinations: CreateAnnouncementDestinationInput[] = []
  const tagIds: string[] = []
  const shiftCodes: HubShift[] = []
  const roles: AnnouncementRole[] = []
  const errors: string[] = []
  const destKeys = new Set<string>()
  const tagSet = new Set<string>()
  const shiftSet = new Set<HubShift>()
  const roleSet = new Set<AnnouncementRole>()

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

  function addShift(code: HubShift) {
    if (!shiftSet.has(code)) {
      shiftSet.add(code)
      shiftCodes.push(code)
    }
  }

  function addRole(role: AnnouncementRole) {
    if (!roleSet.has(role)) {
      roleSet.add(role)
      roles.push(role)
    }
  }

  for (const recipient of recipients) {
    switch (recipient.kind) {
      case 'course': {
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.COURSE, recipient.refId)
        const tagId = findTagIdByHubEntity(tags, 'COURSE', recipient.refId)
        if (!tagId) {
          errors.push(`Tag de curso não encontrada para “${recipient.label}”.`)
          break
        }
        addTag(tagId)
        break
      }
      case 'class': {
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.CLASS, recipient.refId)
        const tagId = findTagIdByHubEntity(tags, 'CLASS', recipient.refId)
        if (!tagId) {
          errors.push(`Tag de turma não encontrada para “${recipient.label}”.`)
          break
        }
        addTag(tagId)
        break
      }
      case 'shift': {
        if (!isHubShift(recipient.refId)) {
          errors.push(`Turno inválido: “${recipient.label}”.`)
          break
        }
        addShift(recipient.refId)
        break
      }
      case 'user':
        addDestination(ANNOUNCEMENT_DESTINATION_TYPE.USER, recipient.refId)
        break
      case 'group': {
        // `EVERYONE` (broadcast) e grupos desconhecidos: sem restrição de papel.
        if (isRecipientGroup(recipient.refId)) {
          addRole(GROUP_TO_ROLE[recipient.refId])
        }
        break
      }
    }
  }

  if (destinations.length === 0) {
    addDestination(ANNOUNCEMENT_DESTINATION_TYPE.GENERAL)
  }

  return { destinations, tagIds, shiftCodes, roles, errors }
}
