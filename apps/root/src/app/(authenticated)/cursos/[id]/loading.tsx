import { Skeleton } from '@portal/ui'

export default function CourseDetailLoading() {
  return (
    <div className="p-6 md:p-8" role="status" aria-label="Carregando curso">
      <div className="max-w-md">
        <Skeleton />
      </div>
      <Skeleton variant="rect" className="mt-8" />
      <Skeleton variant="rect" className="mt-6" />
    </div>
  )
}
