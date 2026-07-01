'use client'

import { useState } from 'react'
import { Text } from '@portal/ui'
import { ChecklistActions } from '../../../components/atoms/ChecklistActions'
import { ChecklistItem } from '../../../components/molecules/ChecklistItem'
import { SuccessModal } from '../../../components/molecules/SuccessModal'
import type { ChecklistHeader, ChecklistItemData } from '../../../types'
import type { StatusValue } from '../../../components/atoms/StatusToggle'

export interface FillChecklistPageProps {
    header: ChecklistHeader
    items: ChecklistItemData[]
    onSubmit?: (answers: Record<string, { status: StatusValue; justification?: string }>) => void
    isSubmitting?: boolean
}

export function FillChecklistPage({
    header,
    items,
    onSubmit,
    isSubmitting = false,
}: FillChecklistPageProps) {
    const [answers, setAnswers] = useState<Record<string, { status: StatusValue; justification?: string }>>({})
    const [showSuccess, setShowSuccess] = useState(false)

    const allAnswered = items.every((item) => {
        const answer = answers[item.id]
        if (!answer?.status) return false
        if (answer.status === 'nao-conforme' && !answer.justification?.trim()) return false
        return true
    })

    const handleStatusChange = (id: string, status: StatusValue) => {
        setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], status } }))
    }

    const handleJustificationChange = (id: string, text: string) => {
        setAnswers((prev) => ({
            ...prev,
            [id]: { status: prev[id]?.status ?? 'nao-conforme', justification: text },
        }))
    }

    const handleSubmit = () => {
        onSubmit?.(answers)
        setShowSuccess(true)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-3 md:px-6 md:py-8">
                <div className="flex flex-col gap-1">
                    <Text variant="heading-h2" tone="brand" className="font-inter font-bold">
                        {header.room}
                    </Text>
                    <Text variant="label-md-emphasis" tone="brand" className="font-inter">
                        {header.checklistType}
                    </Text>
                    <div className="flex flex-col mt-6 gap-1 md:flex-row md:gap-6 text-interactive-pressed">
                        <Text variant="body-sm" className="font-inter">
                            Turma: {header.group}
                        </Text>
                        <Text variant="body-sm" className="font-inter">
                            Preenchido por: {header.filledBy}
                        </Text>
                    </div>
                </div>
                <div className="mt-8">
                    {items.map((item) => (
                        <ChecklistItem
                            key={item.id}
                            title={item.title}
                            {...(item.description ? { description: item.description } : {})}
                            onChange={(status) => handleStatusChange(item.id, status)}
                            onJustificationChange={(text) => handleJustificationChange(item.id, text)}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end px-6 py-6 md:px-10">
                <ChecklistActions
                    onSubmit={handleSubmit}
                    isSubmitDisabled={!allAnswered}
                    isSubmitting={isSubmitting}
                />
            </div>

            <SuccessModal
                open={showSuccess}
                message="Checklist preenchida e enviada com sucesso"
                onClose={() => setShowSuccess(false)}
            />
        </div>
    )
}