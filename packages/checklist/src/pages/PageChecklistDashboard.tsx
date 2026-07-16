import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'

import { PageChecklistDashboardContent } from './PageChecklistDashboardContent'

export async function PageChecklistDashboard() {
  const user = await getCurrentUser()

  return (
    <AppShell user={user} activeKey="checklist">
      <div className="min-h-full bg-background-default p-6 md:p-8 lg:p-10">
        <PageChecklistDashboardContent />
      </div>
    </AppShell>
  )
}

export default PageChecklistDashboard
