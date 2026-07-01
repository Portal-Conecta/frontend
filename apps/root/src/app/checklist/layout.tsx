import type { ReactNode } from 'react'
import { AppShell } from '../_components/AppShell'

export default function ChecklistLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell activeKey="checklist">
            {children}
        </AppShell>
    )
}