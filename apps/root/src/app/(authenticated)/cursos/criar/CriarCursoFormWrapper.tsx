"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createCoursesClient } from '@portal/core/courses/coursesClient'

import { CreateCourseForm } from './CreateCourseForm'

export function CriarCursoFormWrapper() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSalvar = async (data: { code: string; name: string }) => {
    setIsSaving(true)

    try {
      const response = await createCoursesClient([data])

      if (response.status === 201 || response.status === 207) {
        router.push('/cursos')
      }
    } catch (error: any) {
      const status = error?.response?.status

      if (status === 409) {
        alert('Conflito: Já existe um curso cadastrado com este código.') 
      } else {
        alert('Falha ao criar o curso. Verifique os dados e tente novamente.')
      }
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