import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { AppShell } from '@portal/core'
import { getCurrentUser } from '@portal/core/auth/getCurrentUser'
import { Text } from '@portal/ui'
import { CreateClassForm, type Course, type CreateClassPayload } from '@portal/ui/molecules/Classes/CreateClassForm'

import { createClass } from '@portal/core/classes/classesService'
import { listCourses } from '@portal/core/courses/coursesService' 

export const metadata: Metadata = {
  title: 'Criar Nova Turma | Portal Conecta',
}

export default async function CriarTurmaPage() {
  const user = await getCurrentUser()
  
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value || cookieStore.get('token')?.value || ''
  
  // Tipagem ajustada de any[] para Course[]
  let realCourses: Course[] = [] 

  try {
    const response = await listCourses(token)
    
    realCourses = response?.courses || []
    
    if (!Array.isArray(realCourses)) {
        realCourses = []
    }

  } catch (error) {
    console.error('Erro ao buscar lista de cursos reais:', error)
  }

  // Tipagem ajustada de any para CreateClassPayloa
  const handleSubmitClass = async (data: CreateClassPayload) => {
    'use server'
    
    try {
      const serverCookieStore = await cookies()
      const serverToken = serverCookieStore.get('session')?.value || serverCookieStore.get('token')?.value || ''
      
      const payload = {
        courseId: data.courseId,
        number: data.classNumber,
        shift: data.shift
      }

      await createClass(payload as unknown as Parameters<typeof createClass>[0], serverToken)
      
    } catch (error: unknown) {
      console.error('Erro na criação da turma:', error)
      return { success: false }
    }

    revalidatePath('/cursos-turmas')
    redirect('/cursos-turmas')
  }

  const handleCancel = async () => {
    'use server'
    redirect('/cursos-turmas')
  }

  return (
    <AppShell user={user} activeKey="cursos-turmas">
      <main className="mx-auto flex w-full flex-col px-6 pb-10 pt-6">
        
        <div className="mb-10 flex items-center gap-2">
          <Text as="h1" variant="heading-h3" tone="brand">
            Criar Nova Turma
          </Text>
        </div>

        <CreateClassForm 
          courses={realCourses} 
          onSubmitClass={handleSubmitClass} 
          onCancel={handleCancel}
        />

      </main>
    </AppShell>
  )
}