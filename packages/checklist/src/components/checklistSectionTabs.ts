import { can, type CurrentUser } from "@portal/core/rbac";

import type { SectionTab } from "./SectionTabs";

/**
 * Abas do módulo Checklist (gestão) — usadas no dashboard e futuras seções.
 * A aba ativa é resolvida pelo pathname em `SectionTabs`.
 */
export const CHECKLIST_SECTION_TABS: readonly SectionTab[] = [
  { label: "Checklist", href: "/checklist" },
  { label: "Dashboard", href: "/checklist/dashboard" },
  { label: "Monitor de envios", href: "/checklist/nao-conformidades" },
  { label: "Gestão de checklist", href: "/checklist/gestao-itens" },
  { label: "Janelas de envio", href: "/checklist/janelas" },
] as const;

/**
 * Abas visíveis por papel. SENAI/WEG não têm turma vinculada (ver
 * `resolveClassSelection`) — a aba "Checklist" levaria só a um beco sem
 * saída ("sem turma vinculada"), então só ADMIN a vê. Representante/
 * professor nem chegam aqui: `showSectionTabs` já é `false` pra eles.
 *
 * "Janelas de envio" some pra quem não tem `checklist:janelas` (sem TEACHER —
 * o gate real é o 403 do backend em `canManageChecklistTemplates()`, mas não
 * faz sentido nem mostrar a aba pra quem sempre bateria nesse 403).
 */
export function resolveChecklistSectionTabs(
  user: CurrentUser | null | undefined,
): readonly SectionTab[] {
  const tabs = user?.userType === "ADMIN"
    ? CHECKLIST_SECTION_TABS
    : CHECKLIST_SECTION_TABS.filter((tab) => tab.href !== "/checklist");

  if (can(user, "checklist:janelas")) return tabs;
  return tabs.filter((tab) => tab.href !== "/checklist/janelas");
}
