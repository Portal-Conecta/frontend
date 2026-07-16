import type { FileUploadItem, SelectOption } from '@portal/ui'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  ANNOUNCEMENT_STATUS,
  type AnnouncementDetail,
  type AnnouncementStatus,
  type AnnouncementUpdatePayload,
  type CreateAnnouncementDestinationInput,
} from '../../types/announcement'
import { resolveAnnouncementFileUrl } from '../../utils/announcementFile'
import type { AnnouncementContentValue } from '../AnnouncementForm/types'
import { makeRecipient, RECIPIENT_GROUP_EVERYONE, type Recipient } from '../DestinationSelector/types'
import { mapRecipientsToPayload } from '../CreateAnnouncementWizard/mapRecipientsToPayload'

/** Nomes das tags ROLE semeadas no back (V008) → grupo da UI. */
const ROLE_TAG_NAME_TO_GROUP: ReadonlyMap<
  string,
  { group: 'STUDENTS' | 'TEACHERS' | 'REPRESENTATIVES'; label: string }
> = new Map([
  ['Alunos', { group: 'STUDENTS', label: 'Todos os Alunos' }],
  ['Professores', { group: 'TEACHERS', label: 'Todos os Professores' }],
  ['Responsáveis', { group: 'REPRESENTATIVES', label: 'Todos os Representantes' }],
])

export interface EditAnnouncementFormState {
  content: AnnouncementContentValue
  recipients: Recipient[]
  scheduledFor: string | null
  status: AnnouncementStatus
  /** IDs das imagens remotas carregadas no detalhe (para diff na remoção). */
  initialImageIds: string[]
}

/**
 * Converte a descrição do back para HTML do TipTap.
 * HTML sanitizado segue; plain-text vira `<p>` escapado.
 */
export function toEditorDescriptionHtml(raw: string | null | undefined): string {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed) return '<p></p>'
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed

  const escaped = trimmed
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  return `<p>${escaped}</p>`
}

function mapFilesToUploadItems(detail: AnnouncementDetail): FileUploadItem[] {
  const items: FileUploadItem[] = []

  for (const file of detail.files) {
    if (file.type !== 'IMAGE') continue
    const previewUrl = resolveAnnouncementFileUrl(file)?.trim()
    if (!previewUrl) continue

    items.push({
      id: file.id,
      previewUrl,
      name: file.originalName,
    })
  }

  return items
}

/**
 * Converte o detalhe do back no estado inicial do wizard de edição.
 * Imagens remotas entram sem `file` (só `previewUrl`), como prevê o FileUpload.
 */
export function mapDetailToEditForm(detail: AnnouncementDetail): EditAnnouncementFormState {
  const { announcement, destinations, tags } = detail

  const images = mapFilesToUploadItems(detail)

  const tagNameById = new Map(tags.map((tag) => [tag.tagId, tag.tagName]))
  const recipients: Recipient[] = []
  const seen = new Set<string>()
  let hasGeneralDestination = false

  for (const destination of destinations) {
    const refId = destination.referenceId?.trim() ?? ''

    switch (destination.type) {
      case ANNOUNCEMENT_DESTINATION_TYPE.COURSE: {
        if (!refId || seen.has(`course:${refId}`)) break
        seen.add(`course:${refId}`)
        recipients.push(makeRecipient('course', refId, tagNameById.get(refId) ?? refId))
        break
      }
      case ANNOUNCEMENT_DESTINATION_TYPE.CLASS: {
        if (!refId || seen.has(`class:${refId}`)) break
        seen.add(`class:${refId}`)
        recipients.push(makeRecipient('class', refId, tagNameById.get(refId) ?? refId))
        break
      }
      case ANNOUNCEMENT_DESTINATION_TYPE.USER: {
        if (!refId || seen.has(`user:${refId}`)) break
        seen.add(`user:${refId}`)
        recipients.push(makeRecipient('user', refId, tagNameById.get(refId) ?? 'Usuário'))
        break
      }
      case ANNOUNCEMENT_DESTINATION_TYPE.GENERAL: {
        // GENERAL sozinho ≠ “só alunos”. Papéis vêm das tags ROLE abaixo.
        hasGeneralDestination = true
        break
      }
      default:
        break
    }
  }

  // Tags ROLE (nome semeado no back) → chips de grupo; demais tags sem destino
  // correspondente entram como turno/exibição.
  const destinationRefs = new Set(
    destinations.map((item) => item.referenceId).filter((id): id is string => Boolean(id)),
  )
  let hasRoleGroup = false
  for (const tag of tags) {
    const roleGroup = ROLE_TAG_NAME_TO_GROUP.get(tag.tagName)
    if (roleGroup) {
      const key = `group:${roleGroup.group}`
      if (!seen.has(key)) {
        seen.add(key)
        recipients.push(makeRecipient('group', roleGroup.group, roleGroup.label))
        hasRoleGroup = true
      }
      continue
    }

    if (destinationRefs.has(tag.tagId) || seen.has(`shift:${tag.tagId}`)) continue
    seen.add(`shift:${tag.tagId}`)
    recipients.push(makeRecipient('shift', tag.tagId, tag.tagName))
  }

  // Broadcast: GENERAL sem restrição de papel → chip sintético (não é STUDENTS).
  if (hasGeneralDestination && !hasRoleGroup && !seen.has(`group:${RECIPIENT_GROUP_EVERYONE}`)) {
    seen.add(`group:${RECIPIENT_GROUP_EVERYONE}`)
    recipients.push(makeRecipient('group', RECIPIENT_GROUP_EVERYONE, 'Público geral'))
  }

  return {
    content: {
      images,
      title: announcement.title,
      description: toEditorDescriptionHtml(announcement.description),
    },
    recipients,
    scheduledFor:
      announcement.status === ANNOUNCEMENT_STATUS.SCHEDULED
        ? announcement.scheduledFor
        : null,
    status: announcement.status,
    initialImageIds: images.map((item) => item.id),
  }
}

/** Troca label UUID/`Usuário` pelo nome do catálogo Hub (curso/turma). */
export function enrichRecipientsFromCatalog(
  recipients: readonly Recipient[],
  courses: readonly SelectOption[],
  classes: readonly SelectOption[],
): Recipient[] {
  const courseLabels = new Map(courses.map((item) => [item.value, item.label]))
  const classLabels = new Map(classes.map((item) => [item.value, item.label]))

  return recipients.map((recipient) => {
    if (recipient.kind === 'course') {
      const label = courseLabels.get(recipient.refId)
      return label ? { ...recipient, label } : recipient
    }
    if (recipient.kind === 'class') {
      const label = classLabels.get(recipient.refId)
      return label ? { ...recipient, label } : recipient
    }
    return recipient
  })
}

/** Indica se o rótulo ainda é placeholder (UUID, "Usuário", tipo cru). */
export function recipientNeedsName(recipient: Recipient): boolean {
  if (recipient.kind === 'user') {
    return (
      recipient.label === 'Usuário' ||
      recipient.label === 'USER' ||
      recipient.label === recipient.refId
    )
  }
  if (recipient.kind === 'course' || recipient.kind === 'class') {
    return (
      recipient.label === recipient.refId ||
      recipient.label === 'COURSE' ||
      recipient.label === 'CLASS'
    )
  }
  return false
}

/** Destinatários USER ainda sem nome legível. */
export function listUserIdsNeedingLabel(recipients: readonly Recipient[]): string[] {
  return recipients
    .filter((recipient) => recipient.kind === 'user' && recipientNeedsName(recipient))
    .map((recipient) => recipient.refId)
}

export function applyUserLabels(
  recipients: readonly Recipient[],
  labelsByUserId: ReadonlyMap<string, string>,
): Recipient[] {
  if (labelsByUserId.size === 0) return [...recipients]

  return recipients.map((recipient) => {
    if (recipient.kind !== 'user') return recipient
    const label = labelsByUserId.get(recipient.refId)
    return label ? { ...recipient, label } : recipient
  })
}

export interface ResolveRecipientLabelsInput {
  recipients: readonly Recipient[]
  courses: readonly SelectOption[]
  classes: readonly SelectOption[]
  /** Tags do domínio com `hubEntityId` → nome. */
  tagsByHubEntityId?: ReadonlyMap<string, string>
  /** Nomes de usuário já resolvidos. */
  userLabels?: ReadonlyMap<string, string>
}

/** Aplica catálogo + tags + usuários aos rótulos dos destinatários. */
export function resolveRecipientLabels(input: ResolveRecipientLabelsInput): Recipient[] {
  let next = enrichRecipientsFromCatalog(input.recipients, input.courses, input.classes)

  if (input.tagsByHubEntityId && input.tagsByHubEntityId.size > 0) {
    next = next.map((recipient) => {
      if (recipient.kind !== 'course' && recipient.kind !== 'class') return recipient
      if (!recipientNeedsName(recipient)) return recipient
      const label = input.tagsByHubEntityId!.get(recipient.refId)
      return label ? { ...recipient, label } : recipient
    })
  }

  if (input.userLabels) {
    next = applyUserLabels(next, input.userLabels)
  }

  return next
}

export interface BuildEditUpdatePayloadInput {
  title: string
  description: string
  destinations: CreateAnnouncementDestinationInput[]
  /** Status atual do comunicado no back. */
  currentStatus: AnnouncementStatus
  /** `null` = publicar agora; ISO UTC = agendar/reagendar. */
  scheduledFor: string | null
}

/**
 * Monta o body de `PUT /api/posts/{id}` conforme a transição de publicação.
 *
 * - SCHEDULED → publicar agora: `status: PUBLISHED` + `scheduledFor: null`
 * - SCHEDULED → nova data: mantém status e envia `scheduledFor` (ou PATCH depois)
 * - PUBLISHED → agendar: `status: SCHEDULED` + `scheduledFor`
 * - PUBLISHED → permanece agora: só conteúdo/destinos
 */
export function buildEditUpdatePayload(input: BuildEditUpdatePayloadInput): AnnouncementUpdatePayload {
  const title = input.title.trim()
  const description = input.description.trim()
  const destinations = input.destinations

  if (input.scheduledFor == null) {
    if (input.currentStatus === ANNOUNCEMENT_STATUS.SCHEDULED) {
      return {
        title,
        description,
        destinations,
        status: ANNOUNCEMENT_STATUS.PUBLISHED,
        // Limpa o agendamento no back (junto com publishedAt=now na transição).
        scheduledFor: null,
      }
    }

    return { title, description, destinations }
  }

  if (input.currentStatus === ANNOUNCEMENT_STATUS.PUBLISHED) {
    return {
      title,
      description,
      destinations,
      status: ANNOUNCEMENT_STATUS.SCHEDULED,
      scheduledFor: input.scheduledFor,
    }
  }

  return {
    title,
    description,
    destinations,
    scheduledFor: input.scheduledFor,
  }
}

export function buildDestinationsFromRecipients(
  recipients: readonly Recipient[],
): CreateAnnouncementDestinationInput[] {
  return mapRecipientsToPayload(recipients).destinations
}

export function resolveRemovedImageIds(
  initialImageIds: readonly string[],
  currentImages: readonly FileUploadItem[],
): string[] {
  const remainingRemote = new Set(
    currentImages.filter((item) => !item.file).map((item) => item.id),
  )
  return initialImageIds.filter((id) => !remainingRemote.has(id))
}

export function hasLocalImageFiles(images: readonly FileUploadItem[]): boolean {
  return images.some((item) => Boolean(item.file))
}

export function hasRemainingRemoteImages(images: readonly FileUploadItem[]): boolean {
  return images.some((item) => !item.file && Boolean(item.previewUrl))
}
