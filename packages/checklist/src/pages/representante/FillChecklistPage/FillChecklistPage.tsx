'use client'

import { Text } from '@portal/ui'

import { ChecklistActions } from '../../../components/atoms/ChecklistActions'
import { ChecklistItem } from '../../../components/molecules/ChecklistItem'
import type { ChecklistHeader, ChecklistItemData } from '../../../types'

export interface FillChecklistPageProps {
    header: ChecklistHeader
    items: ChecklistItemData[]
    onItemChange?: (id: string, status: 'conforme' | 'nao-conforme', justification?: string) => void
    onSubmit?: () => void
    isSubmitting?: boolean
}

export function FillChecklistPage({
    header,
    items,
    onItemChange,
    onSubmit,
    isSubmitting = false,
}: FillChecklistPageProps) {
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
                            onChange={(status) => onItemChange?.(item.id, status)}
                            onJustificationChange={(text) => onItemChange?.(item.id, 'nao-conforme', text)}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end px-6 py-6 md:px-10">
                <ChecklistActions onSubmit={() => onSubmit?.()} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}