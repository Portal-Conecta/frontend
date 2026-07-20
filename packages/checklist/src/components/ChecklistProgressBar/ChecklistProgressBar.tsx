import { Text } from "@portal/ui";

export interface ChecklistProgressBarProps {
  /** Itens já respondidos. */
  answered: number;
  /** Total de itens do checklist. */
  total: number;
  className?: string;
}

export function ChecklistProgressBar({
  answered,
  total,
  className,
}: ChecklistProgressBarProps) {
  const safeTotal = Math.max(0, total);
  const safeAnswered = Math.min(Math.max(0, answered), safeTotal);
  const percent = safeTotal > 0 ? (safeAnswered / safeTotal) * 100 : 0;

  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
      <Text variant="label-sm" tone="secondary">
        {safeAnswered} de {safeTotal} itens respondidos
      </Text>

      <div
        role="progressbar"
        aria-label="Progresso do checklist"
        aria-valuenow={safeAnswered}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        className="h-2 w-full overflow-hidden rounded-full bg-background-surface"
      >
        <div
          className="h-full rounded-full bg-interactive-default transition-[width] duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
