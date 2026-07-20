/**
 * Contrato de RBAC do Portal Conecta (ADR-0014).
 *
 * O backend não serve um `/me` de perfil nem uma lista de permissões: os direitos
 * do usuário vivem implícitos nos claims do JWT (`sub`, `userType`, `classes`) e a
 * matriz "quem pode o quê" é hardcoded nos validators Java. O BFF **monta** este
 * contrato a partir do token — decodifica os claims e aplica a tabela
 * `rolePermissions` — entregando ao front um "crachá" limpo e estável (`CurrentUser`).
 *
 * Duas dimensões de papel, ambas vindas do JWT:
 * - `userType`  — global, 1 por usuário. Resolve a lista `permissions`.
 * - `ClassRole` — por matrícula (usuário × turma). Escopo para checagens por turma.
 */

/** Valores aceitos pelo claim global `userType`. */
export const TYPE_USER_VALUES = [
  'STUDENT',
  'REPRESENTATIVE',
  'TEACHER',
  'SENAI',
  'WEG',
  'ADMIN',
] as const

/** Papel global do usuário (claim `userType`). 1 por usuário. */
export type TypeUser = (typeof TYPE_USER_VALUES)[number]

/** Type guard para valores recebidos de JWT, URL e corpo de requisição. */
export function isTypeUser(value: unknown): value is TypeUser {
  return typeof value === 'string' && (TYPE_USER_VALUES as readonly string[]).includes(value)
}

/** Papel do usuário dentro de uma turma específica (claim `classes[].role`). */
export type ClassRole = 'STUDENT' | 'TEACHER' | 'REPRESENTATIVE'

/**
 * Vocabulário de permissões no formato `dominio:acao`. "Ver" (visibilidade de
 * módulo/nav) também é permissão, para que todo gate use o mesmo mecanismo `can`.
 */
export type Permission =
  | 'comunicados:ver'
  | 'mapa:ver'
  | 'checklist:ver'
  | 'usuarios:listar'
  | 'usuarios:gerenciar'
  | 'salas:gerenciar'
  | 'cursos:gerenciar'
  | 'turmas:gerenciar'
  | 'matriculas:gerenciar'

/** Vínculo do usuário com uma turma e seu papel nela. */
export interface ClassMembership {
  classId: string
  role: ClassRole
}

/**
 * O "crachá": identidade + autorização do usuário autenticado, montado pelo BFF.
 * Perfil (nome/email/avatar) entra depois, via `GET /users/{id}` — não faz parte
 * do contrato mínimo de RBAC.
 */
export interface CurrentUser {
  /** Claim `sub` do JWT. */
  id: string
  userType: TypeUser
  classes: ClassMembership[]
  /** Permissões globais resolvidas no servidor a partir de `userType`. */
  permissions: Permission[]
}
