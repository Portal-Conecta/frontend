import { notFound, redirect } from 'next/navigation'

import { ErrorPage } from '@portal/ui'

import { getCurrentUser } from '../auth/getCurrentUser'
import { getSession } from '../auth/session'
import { getCourseDetail } from '../courses/coursesService'
import { HttpError } from '../http/errors'
import { ERROR_PRESENTATION } from '../http/errorPresentation'
import { can } from '../rbac/can'
import { PageCourseDetailContent } from './PageCourseDetailContent'

export interface PageCourseDetailProps {
  courseId: string
}

/** Tela de detalhe de Curso (#359), carregada no servidor e hidratada para edição/filtros. */
export async function PageCourseDetail({ courseId }: PageCourseDetailProps) {
  const token = await getSession()
  if (!token) redirect('/login')

  const user = await getCurrentUser()
  if (!can(user, 'cursos:gerenciar')) redirect('/comunicados')

  try {
    const course = await getCourseDetail(courseId, token)
    return <PageCourseDetailContent initialCourse={course} />
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.kind === 'unauthorized') redirect('/login')
      if (error.kind === 'forbidden') return <ErrorPage {...ERROR_PRESENTATION.forbidden} />
      if (error.kind === 'not_found') notFound()
    }
    return <ErrorPage {...ERROR_PRESENTATION.server} />
  }
}

export default PageCourseDetail
