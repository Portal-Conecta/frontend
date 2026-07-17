"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createCoursesClient } from '@portal/core/courses/coursesClient'
import { HttpError } from '@portal/core/http/errors'

import { CreateCourseForm } from './CreateCourseForm'

export function CriarCursoFormWrapper() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSalvar = async (data: { code: string; name: string }) => {
    setIsSaving(true)

    try {
      const response = await createCoursesClient([data])

      if (response.errorCount === 0) {
        router.push('/cursos')
        return
      }
      
      const firstError = response.results.find((r) => r.status === 'error')
      alert(firstError?.error?.message ?? 'Falha ao criar o curso. Verifique os dados e tente novamente.')

    } catch (err) {
      if (err instanceof HttpError) {
        const message =
          err.status === 409
            ? 'Já existe um curso cadastrado com este código.'
            : (err.body?.message ?? 'Falha ao criar o curso. Verifique os dados e tente novamente.')
        
        alert(message)
        return
      }
      
      alert('Falha inesperada ao criar o curso. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelar = () => {
    router.back()
  }

  return (
    <CreateCourseForm 
      onSubmit={handleSalvar} 
      onCancel={handleCancelar} 
      isSaving={isSaving} 
    />
  )
}