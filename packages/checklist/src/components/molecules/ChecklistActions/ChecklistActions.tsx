import { Button } from "@portal/ui";

interface ChecklistActionsProps {
    onSaveDraft: () => void;
    onSubmit: () => void;
    isSubmitDisabled?: boolean;
    isSubmitting?: boolean;
}

export function ChecklistActions({
    onSaveDraft,
    onSubmit,
    isSubmitDisabled = false,
    isSubmitting = false,
}: ChecklistActionsProps) {
    return (
        <div className="flex items-center gap-6">
            <Button
                iconLeft="check-check"
                onClick={onSaveDraft}
                className="font-semibold text-base"
            >
                Salvar Rascunho
            </Button>

            <Button
                iconLeft="check-check"
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                loading={isSubmitting}
                className="font-semibold text-base"
            >
                Enviar Checklist
            </Button>
        </div>
    );
}