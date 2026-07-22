import { EmptyState, Icon } from "@portal/ui";
import type { ReactNode } from "react";

export interface ChecklistWindowClosedStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ChecklistWindowClosedState({
  title = "Fora do horário de preenchimento",
  description = "Não há uma janela de preenchimento aberta para esta turma no momento",
  action,
  className,
}: ChecklistWindowClosedStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      illustration={
        <div className="mb-4 text-text-disabled" aria-hidden="true">
          <Icon name="circle-alert" size="lg" decorative />
        </div>
      }
      {...(action ? { action } : {})}
      className={className}
    />
  );
}
