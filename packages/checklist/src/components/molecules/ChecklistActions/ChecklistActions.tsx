'use client'

import { Button } from '@portal/ui'

interface ChecklistActionsProps {
    onSubmit: () => void
    isSubmitDisabled?: boolean
    isSubmitting?: boolean
}

export function ChecklistActions({
    onSubmit,
    isSubmitDisabled = false,
    isSubmitting = false,
}: ChecklistActionsProps) {
    return (
        <Button
        iconLeft="check-check"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        loading={isSubmitting}
        className="font-semibold text-base"
        >
        Enviar Checklist
        </Button>
    )
}