import type { CurrentUser } from '@portal/core/rbac'

import type { SectionTab } from './SectionTabs'

/**
 * Abas do módulo Checklist (gestão) — usadas no dashboard e futuras seções.
 * A aba ativa é resolvida pelo pathname em `SectionTabs`.
 */
export const CHECKLIST_SECTION_TABS: readonly SectionTab[] = [
  { label: 'Checklist', href: '/checklist' },
  { label: 'Dashboard', href: '/checklist/dashboard' },
  { label: 'Monitor de envios', href: '/checklist/monitor-envios' },
  { label: 'Gestão de checklist', href: '/checklist/gestao' },
] as const

/**
 * Abas visíveis por papel. SENAI/WEG não têm turma vinculada (ver
 * `resolveClassSelection`) — a aba "Checklist" levaria só a um beco sem
 * saída ("sem turma vinculada"), então só ADMIN a vê. Representante/
 * professor nem chegam aqui: `showSectionTabs` já é `false` pra eles.
 */
export function resolveChecklistSectionTabs(
  user: CurrentUser | null | undefined,
): readonly SectionTab[] {
  if (user?.userType === 'ADMIN') return CHECKLIST_SECTION_TABS
  return CHECKLIST_SECTION_TABS.filter((tab) => tab.href !== '/checklist')
}
