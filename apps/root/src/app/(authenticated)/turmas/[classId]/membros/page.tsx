import { PageTurmaMembros } from '@portal/core/classes/PageTurmaMembros'

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  return <PageTurmaMembros classId={classId} />
}
