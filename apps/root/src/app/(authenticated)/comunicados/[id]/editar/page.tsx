import { notFound } from 'next/navigation'

import { PageEditarComunicado } from '@portal/comunicados/pages/PageEditarComunicado'

interface EditarComunicadoPageProps {
  params: Promise<{ id: string }>
}

/**
 * Rota fina de edição — `/comunicados/[id]/editar`.
 * Delega ao domínio `@portal/comunicados`.
 */
export default async function EditarComunicadoPage({ params }: EditarComunicadoPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  return <PageEditarComunicado id={id} />
}
