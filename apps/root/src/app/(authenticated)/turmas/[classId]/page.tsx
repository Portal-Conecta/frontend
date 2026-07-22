import type { Metadata } from 'next'

import { PageTurmaDetalhe } from '@portal/core/classes/PageTurmaDetalhe'

export const metadata: Metadata = {
  title: 'Turma | Portal Conecta',
}

/**
 * Sem `AppShell`: o layout do grupo `(authenticated)` (#405) já o monta. O item
 * ativo da Sidebar sai do pathname (`activeKeyFromPathname` casa por prefixo,
 * então `/turmas/<id>` acende "Turmas").
 */
export default async function TurmaDetalhePage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params

  return <PageTurmaDetalhe classId={classId} />
}
