import { notFound } from 'next/navigation';
import { PageEditarComunicado } from './PageEditarComunicado';

interface EditarComunicadoProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: EditarComunicadoProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <PageEditarComunicado announcementId={id} />;
}