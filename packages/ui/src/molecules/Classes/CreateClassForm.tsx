"use client"

import React, { useState, useMemo } from 'react'
import { Text, Button, Input, Select, ConfirmDialog } from '@portal/ui'

export interface Course {
    id: string
    code: string
    name: string
}

export interface CreateClassPayload {
    courseId: string
    classNumber: string
    shift: string
}

export interface CreateClassFormProps {
    courses: Course[]
    onSubmitClass: (data: CreateClassPayload) => Promise<{ success: boolean; error?: string }>
    onCancel?: () => void
}

const SHIFT_OPTIONS = [
    { value: 'FULL_AM_PM', label: 'Manhã e tarde' },
    { value: 'FULL_PM_NT', label: 'Tarde e noite' },
]

export function CreateClassForm({ courses, onSubmitClass, onCancel }: CreateClassFormProps) {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [classNumber, setClassNumber] = useState<string>('')
    const [shift, setShift] = useState<string>('')

    const [courseSearch, setCourseSearch] = useState<string>('')

    const [errors, setErrors] = useState<{ course?: boolean; classNumber?: boolean; shift?: boolean }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)

    const filteredCourses = useMemo(() => {
        if (!courseSearch.trim()) return courses
        const query = courseSearch.toLowerCase()
        return courses.filter(
            (course) =>
                course.code.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query)
        )
    }, [courses, courseSearch])

    const validateForm = () => {
        const newErrors = {
            course: !selectedCourseId,
            classNumber: !classNumber.trim(),
            shift: !shift,
        }
        setErrors(newErrors)
        return !Object.values(newErrors).some(Boolean)
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setIsSubmitting(true)
        setShowErrorModal(false)

        try {
            const response = await onSubmitClass({
                courseId: selectedCourseId,
                classNumber: classNumber.trim(),
                shift
            })

            if (response && response.success === false) {
                setShowErrorModal(true)
            }
        } catch (error) {
            const isRedirectError = error instanceof Error && error.message.includes('NEXT_REDIRECT')
            
            if (!isRedirectError) {
                setShowErrorModal(true)
            }
        } finally {
        }
    }

    return (
        <div className="relative flex h-full w-full flex-col">

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-14 gap-y-10 overflow-y-visible pt-4 md:grid-cols-12">

                <div className="flex min-h-0 flex-col gap-4 md:col-span-8">
                    <div className="flex flex-col gap-2">
                        <Text variant="label-md-emphasis" tone="brand">Curso</Text>
                        <Input
                            placeholder="Todos"
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            error={errors.course ? "Este campo é obrigatório" : ""}
                        />
                    </div>

                    <div className="mt-2 flex min-h-[300px] flex-1 flex-col gap-1 overflow-y-auto rounded-md">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <button
                                    key={course.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCourseId(course.id)
                                        setErrors((prev) => ({ ...prev, course: false }))
                                    }}
                                    className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-surface-hover ${selectedCourseId === course.id
                                        ? 'border-border-focus bg-surface-selected'
                                        : 'border-transparent bg-surface-base'
                                        }`}
                                >
                                    <Text variant="label-md-emphasis" tone="brand" className="w-16">
                                        {course.code}
                                    </Text>
                                    <span className="text-text-brand">|</span>
                                    <Text variant="body-sm" tone="brand" className="flex-1 truncate">
                                        {course.name}
                                    </Text>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center text-text-secondary">
                                Nenhum curso encontrado para "{courseSearch}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-8 overflow-visible pb-32 md:col-span-4">
                    <div className="flex flex-col gap-2">
                        <Text variant="label-md-emphasis" tone="brand">Número da Turma</Text>
                        <Input
                            placeholder="Digitar"
                            value={classNumber}
                            onChange={(e) => {
                                setClassNumber(e.target.value)
                                setErrors((prev) => ({ ...prev, classNumber: false }))
                            }}
                            error={errors.classNumber ? "Este campo é obrigatório" : ""}
                        />
                    </div>

                    <div className="relative z-50 flex flex-col gap-2">
                        <Text variant="label-md-emphasis" tone="brand">Turno</Text>
                        <Select
                            placeholder="Todos"
                            value={shift}
                            options={SHIFT_OPTIONS}
                            onChange={(value) => {
                                setShift(value ?? '')
                                setErrors((prev) => ({ ...prev, shift: false }))
                            }}
                            error={errors.shift ? "Este campo é obrigatório" : ""}
                        />
                    </div>

                    <div className="mt-auto flex gap-2">
                        <Button
                            variant="outlined" tone="brand" size="sm"
                            onClick={onCancel} disabled={isSubmitting}
                            className="flex-1 rounded-full px-2 text-xs md:text-sm lg:text-md"
                        >
                            Descartar
                        </Button>
                        <Button
                            variant="solid" tone="brand" size="sm"
                            onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}
                            className="flex-1 rounded-full px-2 text-xs md:text-sm lg:text-md"
                        >
                            Criar turma
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                subTitle=""
                title="Eita, algo não saiu como o esperado!"
                content="Estamos trabalhando nisso, tente novamente em breve."
                labelCancel="Fechar"
                labelConfirm="Tentar novamente"
                confirmTone="brand"
                onConfirm={() => {
                    setShowErrorModal(false)
                    handleSubmit()
                }}
            />
        </div>
    )
}