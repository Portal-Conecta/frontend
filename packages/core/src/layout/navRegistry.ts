/**
 * Registro de navegação do shell — dado declarativo, sem React.
 *
 * Cada item declara a permissão que exige (`requires`); item sem `requires` é
 * visível a todo usuário autenticado. A Sidebar filtra este registro com
 * `filterByPermission` (motor de RBAC do core). Mudar quem vê o quê = editar aqui
 * + a tabela `rolePermissions` do core.
 */
import type { Permission } from '@portal/core'
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
  { key: 'config', icon: 'settings', label: 'Configurações', href: '/configuracoes', requires: 'usuarios:gerenciar' },
]
