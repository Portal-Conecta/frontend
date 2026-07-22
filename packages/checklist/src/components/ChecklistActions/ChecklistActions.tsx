import { Button } from "@portal/ui";

export interface ChecklistActionsProps {
  mode?: "submit" | "edit";
  onSubmit: () => void;
  onEdit?: () => void;
  isSubmitDisabled?: boolean;
  isSubmitting?: boolean;
  /** Sobrescreve o texto do botão de envio (ex.: "Salvar Alterações" após já enviado). */
  submitLabel?: string;
  className?: string;
}

export function ChecklistActions({
  mode = "submit",
  onSubmit,
  onEdit,
  isSubmitDisabled = false,
  isSubmitting = false,
  submitLabel = "Enviar Checklist",
  className,
}: ChecklistActionsProps) {
  if (mode === "edit") {
    return (
      <Button iconLeft="square-pen" onClick={onEdit} className={className}>
        Editar Checklist
      </Button>
    );
  }

  return (
    <Button
      iconLeft="check-check"
      onClick={onSubmit}
      disabled={isSubmitDisabled}
      loading={isSubmitting}
      className={className}
    >
      {submitLabel}
    </Button>
  );
}
