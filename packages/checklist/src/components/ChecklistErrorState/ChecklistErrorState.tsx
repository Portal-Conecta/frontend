import { Button, EmptyState, Icon } from "@portal/ui";
import type { ReactNode } from "react";

export interface ChecklistErrorStateProps {
  title?: string;
  description: string;
  /** Rótulo do botão de retry. Ignorado se `action` for informado. */
  retryLabel?: string;
  onRetry?: () => void;
  /** Ação customizada; sobrepõe `onRetry`/`retryLabel`. */
  action?: ReactNode;
  className?: string;
}

/** Estado padrão de erro (falha ao carregar dado) no fluxo de checklist do representante. */
export function ChecklistErrorState({
  title = "Não foi possível carregar",
  description,
  retryLabel = "Tentar novamente",
  onRetry,
  action,
  className,
}: ChecklistErrorStateProps) {
  const resolvedAction =
    action ??
    (onRetry ? (
      <Button variant="outlined" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : undefined);

  return (
    <EmptyState
      title={title}
      description={description}
      illustration={
        <div className="mb-4 text-feedback-error" aria-hidden="true">
          <Icon name="triangle-alert" size="lg" decorative />
        </div>
      }
      {...(resolvedAction ? { action: resolvedAction } : {})}
      className={className}
    />
  );
}
