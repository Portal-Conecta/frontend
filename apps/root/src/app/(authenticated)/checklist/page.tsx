import { redirect } from 'next/navigation'

/** Entrada do módulo Checklist → dashboard (gestão). */
export default function ChecklistIndexPage() {
  redirect('/checklist/dashboard')
}
