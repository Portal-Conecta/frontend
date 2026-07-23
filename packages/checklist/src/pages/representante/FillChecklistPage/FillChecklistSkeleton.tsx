import { Skeleton } from "@portal/ui";

export interface FillChecklistSkeletonProps {
  /** Quantidade de linhas de item (default 6). */
  itemCount?: number;
  className?: string;
}

/**
 * Skeleton da tela de preenchimento — espelha o layout real de
 * `FillChecklistPage` (header com voltar/título/progresso, select de turma,
 * lista de itens + footer de ação) pra não "saltar" quando o template carrega.
 */
export function FillChecklistSkeleton({
  itemCount = 6,
  className,
}: FillChecklistSkeletonProps) {
  return (
    <div
      className={["flex h-full flex-col", className].filter(Boolean).join(" ")}
      aria-busy="true"
      aria-label="Carregando checklist"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 md:px-6 md:pb-6">
        {/* Header: botão voltar + sala/tipo | barra de progresso */}
        <header className="py-4 md:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-1">
              <Skeleton variant="circle" width={40} height={40} />
              <div className="min-w-0 flex-1 pt-1">
                <Skeleton variant="text" width={200} height={28} />
                <div className="mt-2">
                  <Skeleton variant="text" width={160} height={18} />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 lg:shrink-0 lg:pt-1">
              <Skeleton variant="rect" height={12} />
              <div className="mt-2 flex justify-between">
                <Skeleton variant="text" width={64} height={14} />
                <Skeleton variant="text" width={48} height={14} />
              </div>
            </div>
          </div>
        </header>

        {/* Select de turma */}
        <div className="max-w-xs pt-4">
          <Skeleton variant="text" width={48} height={14} />
          <div className="mt-2">
            <Skeleton variant="rect" height={40} />
          </div>
        </div>

        {/* Itens do checklist — mesma borda/py do ChecklistItem */}
        <div className="mt-6">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-t border-border-default py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton
                  variant="text"
                  width={i % 2 === 0 ? 220 : 180}
                  height={16}
                />
                <Skeleton
                  variant="text"
                  width={i % 3 === 0 ? 280 : 140}
                  height={14}
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <Skeleton variant="rect" width={120} height={40} />
                <Skeleton variant="rect" width={120} height={40} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer com botão de enviar */}
      <div className="flex shrink-0 justify-end px-3 py-4 md:px-6 md:py-6">
        <div className="w-full sm:w-[168px]">
          <Skeleton variant="rect" height={40} />
        </div>
      </div>
    </div>
  );
}
