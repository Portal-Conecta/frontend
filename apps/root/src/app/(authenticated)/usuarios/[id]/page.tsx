import { PageUserProfile } from '@portal/core/pages/PageUserProfile'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Rota fina — visão admin do perfil (`/usuarios/[id]`, #443). */
export default async function UsuariosIdPage({ params }: PageProps) {
  const { id } = await params
  return <PageUserProfile userId={id} />
}
