export default function CourseDetailLoading() {
  return (
    <div className="animate-pulse p-6 md:p-8" role="status" aria-label="Carregando curso">
      <div className="h-8 w-80 max-w-full rounded-md bg-background-default" />
      <div className="mt-8 h-12 rounded-md bg-background-default" />
      <div className="mt-6 h-72 rounded-md bg-background-default" />
    </div>
  )
}
