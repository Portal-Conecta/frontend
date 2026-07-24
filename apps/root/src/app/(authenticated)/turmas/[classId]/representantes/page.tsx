import type { Metadata } from 'next'

import { PageTurmaRepresentantes } from '@portal/core/classes/PageTurmaRepresentantes'

export const metadata: Metadata = {
  title: 'Alterar representantes | Portal Conecta',
}

/**
 * Sem `AppShell`: o layout do grupo `(authenticated)` (#405) já o monta.
 */
export default async function TurmaRepresentantesPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params

  return <PageTurmaRepresentantes classId={classId} />
}
