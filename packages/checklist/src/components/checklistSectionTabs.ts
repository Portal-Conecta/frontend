import type { SectionTab } from './SectionTabs'

/**
 * Abas do módulo Checklist (gestão) — usadas no dashboard e futuras seções.
 * A aba ativa é resolvida pelo pathname em `SectionTabs`.
 */
export const CHECKLIST_SECTION_TABS: readonly SectionTab[] = [
  { label: 'Dashboard', href: '/checklist/dashboard' },
  { label: 'Itens', href: '/checklist/itens' },
  { label: 'Histórico', href: '/checklist/historico' },
] as const
