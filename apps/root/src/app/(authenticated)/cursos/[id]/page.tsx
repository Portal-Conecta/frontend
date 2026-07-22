import { PageCourseDetail } from '@portal/core/pages/PageCourseDetail'

export default async function CourseDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PageCourseDetail courseId={id} />
}
