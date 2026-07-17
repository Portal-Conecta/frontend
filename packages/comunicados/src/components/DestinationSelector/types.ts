/**
 * Modelo de destinatário do comunicado (público-alvo).
 *
 * O componente `DestinationSelector` (#195) produz uma lista rica de
 * `Recipient[]` que cobre os quatro modos de seleção da tela. O back-end
 * separa escopo espacial (`destinations`: GENERAL | COURSE | CLASS | USER) de
 * restrição de papel (`roles`: UserType → tag ROLE). Grupos da UI
 * (Alunos/Professores/Representantes) mapeiam para `roles`; curso/turma/usuário
 * mapeiam para `destinations`. O mapeamento fica em `mapRecipientsToPayload`.
 */

/** Origem/natureza de cada destinatário selecionado. */
export type RecipientKind = 'course' | 'class' | 'shift' | 'group' | 'user'

/** Grupos amplos por papel (modo "Selecionar usuários por tipo"). */
export type RecipientGroup = 'STUDENTS' | 'TEACHERS' | 'REPRESENTATIVES'

/**
 * Chip sintético de broadcast (GENERAL sem `roles`) — usado na edição quando o
 * detalhe traz destino GENERAL sem tags ROLE. Não aparece no `GroupTypePanel`.
 */
export const RECIPIENT_GROUP_EVERYONE = 'EVERYONE' as const

export interface Recipient {
  /** Chave única (`kind:refId`) usada para deduplicar e remover. */
  key: string
  kind: RecipientKind
  /** id da tag (curso/turma), valor do turno, grupo ou id do usuário. */
  refId: string
  /** Rótulo exibido no chip de destinatário. */
  label: string
}

/** Usuário resumido para a busca do modo "Buscar usuários específicos". */
export interface UserSummary {
  id: string
  name: string
  /** Papel/descrição curta exibida abaixo do nome (ex.: "Aluno · DS 2026"). */
  role?: string
}

export function recipientKey(kind: RecipientKind, refId: string): string {
  return `${kind}:${refId}`
}

export function makeRecipient(kind: RecipientKind, refId: string, label: string): Recipient {
  return { key: recipientKey(kind, refId), kind, refId, label }
}

export function hasRecipient(list: readonly Recipient[], key: string): boolean {
  return list.some((item) => item.key === key)
}

/** Adiciona sem duplicar (mesma `key` é ignorada). */
export function addRecipient(list: readonly Recipient[], recipient: Recipient): Recipient[] {
  return hasRecipient(list, recipient.key) ? [...list] : [...list, recipient]
}

/** Alterna: remove se já existe, adiciona caso contrário. */
export function toggleRecipient(list: readonly Recipient[], recipient: Recipient): Recipient[] {
  return hasRecipient(list, recipient.key)
    ? list.filter((item) => item.key !== recipient.key)
    : [...list, recipient]
}

export function removeRecipient(list: readonly Recipient[], key: string): Recipient[] {
  return list.filter((item) => item.key !== key)
}
