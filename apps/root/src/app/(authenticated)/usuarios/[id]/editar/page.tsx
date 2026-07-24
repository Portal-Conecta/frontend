import { PageEditUser } from '@portal/core/pages/PageEditUser'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PageEditUser userId={id} />
}
