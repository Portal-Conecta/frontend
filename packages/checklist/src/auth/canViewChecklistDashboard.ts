import { can, type CurrentUser } from '@portal/core/rbac'

/**
 * Dashboard gerencial de checklist — espelha `RequestContext.canViewDashboard()`
 * do backend (gestão SENAI / WEG; ADMIN incluso na matriz do front).
 */
export function canViewChecklistDashboard(user: CurrentUser | null | undefined): boolean {
  return can(user, 'checklist:dashboard')
}
