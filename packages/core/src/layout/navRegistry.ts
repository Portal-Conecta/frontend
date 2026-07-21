/**
 * Registro de navegação do shell — dado declarativo, sem React.
 *
 * Cada item declara a permissão que exige (`requires`); item sem `requires` é
 * visível a todo usuário autenticado. A Sidebar filtra este registro com
 * `filterByPermission` (motor de RBAC do core). Mudar quem vê o quê = editar aqui
 * + a tabela `rolePermissions` do core.
 */
import { filterByPermission, type CurrentUser, type Permission } from '../rbac'
import type { IconName } from '@portal/ui'

export interface NavEntry {
  key: string
  icon: IconName
  label: string
  href: string
  /** Permissão exigida para ver o item. Ausente = todo autenticado vê. */
  requires?: Permission
}

export const NAV_REGISTRY: readonly NavEntry[] = [
  { key: 'comunicados', icon: 'newspaper', label: 'Comunicados', href: '/comunicados' },
  { key: 'mapa-salas', icon: 'map', label: 'Mapa de Sala', href: '/mapa-salas' },
  { key: 'checklist', icon: 'clipboard-list', label: 'Checklist', href: '/checklist', requires: 'checklist:ver' },
  { key: 'usuarios', icon: 'user-cog', label: 'Usuários', href: '/usuarios', requires: 'usuarios:gerenciar' },
  { key: 'turma', icon: 'users', label: 'Geren. Turmas', href: '/turmas', requires: 'turmas:gerenciar' },
  { key: 'cursos', icon: 'graduation-cap', label: 'Cursos', href: '/cursos', requires: 'cursos:gerenciar' },
]

/**
 * Modelo de nav por papel — resultado do `NAV_REGISTRY` cruzado com a matriz
 * `rolePermissions` do RBAC. Contrato travado por teste (`tests/layout/navRegistry`).
 *
 * | Item        | requires           | STUDENT | REPRES. | TEACHER | SENAI | WEG | ADMIN |
 * |-------------|--------------------|:-------:|:-------:|:-------:|:-----:|:---:|:-----:|
 * | comunicados | - (universal)      |   sim   |   sim   |   sim   |  sim  | sim |  sim  |
 * | mapa-salas  | - (universal)      |   sim   |   sim   |   sim   |  sim  | sim |  sim  |
 * | checklist   | checklist:ver      |   nao   |   sim   |   sim   |  sim  | sim |  sim  |
 * | usuarios    | usuarios:gerenciar |   nao   |   nao   |   nao   |  sim  | sim |  sim  |
 * | turma       | turmas:gerenciar   |   nao   |   nao   |   nao   |  sim  | sim |  sim  |
 * | cursos      | cursos:gerenciar   |   nao   |   nao   |   nao   |  sim  | sim |  sim  |
 *
 * Invariante: comunicados + mapa são universais, então todo papel autenticado vê
 * >= 2 itens — a nav nunca fica vazia (decisão do "A decidir" da #173).
 *
 * Lembre: isto é UX (o que aparece na Sidebar). O gate real é o 403 do backend em
 * toda chamada. Mudar quem vê o quê = editar `requires` aqui + `rolePermissions`.
 */
export function visibleNavFor(user: CurrentUser | null): NavEntry[] {
  return filterByPermission(NAV_REGISTRY, user)
}

/**
 * Resolve a key ativa da nav a partir do pathname — match exato ou por prefixo
 * de segmento (`/comunicados/criar` ativa `comunicados`; `/comunicadosx` não
 * ativa nada). Rota fora do registry (perfil, ajuda, 404…) resolve `''`,
 * nenhum item ativo. Contrato travado por teste (`tests/layout/navRegistry`).
 */
export function activeKeyFromPathname(pathname: string): string {
  const entry = NAV_REGISTRY.find(
    ({ href }) => pathname === href || pathname.startsWith(href + '/'),
  )
  return entry?.key ?? ''
}
