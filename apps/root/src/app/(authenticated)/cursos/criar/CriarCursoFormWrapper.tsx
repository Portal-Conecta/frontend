"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { CreateCourseForm } from '@portal/ui'

export function CriarCursoFormWrapper() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSalvar = async (data: { codigo: string; nome: string }) => {
    setIsSaving(true)
    
    try {
      console.log('Dados enviados para a API:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/cursos')
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
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