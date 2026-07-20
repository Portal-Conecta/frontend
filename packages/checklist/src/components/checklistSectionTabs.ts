import type { SectionTab } from './SectionTabs'

/**
 * Abas do módulo Checklist (gestão) — usadas no dashboard e futuras seções.
 * A aba ativa é resolvida pelo pathname em `SectionTabs`.
 */
export const CHECKLIST_SECTION_TABS: readonly SectionTab[] = [
  { label: 'Dashboard', href: '/checklist/dashboard' },
  { label: 'Monitor de envios', href: '/checklist/monitor-envios' },
  { label: 'Gestão de checklist', href: '/checklist/gestao' },
] as const
