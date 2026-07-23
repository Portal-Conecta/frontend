import { Skeleton } from '@portal/ui'

/**
 * Loading de navegação (Suspense) da rota /checklist — espelha o esqueleto
 * do fluxo de preenchimento (seleção de sala), mesma estrutura que o
 * SelectRoomPage real usa no próprio loading de dados. Só o conteúdo: o
 * AppShell vem do layout `(authenticated)` e já está na tela durante o
 * Suspense.
 *
 * Sem skeleton de SectionTabs aqui: só ADMIN vê as abas nessa rota
 * (professor/representante preenchem direto, sem elas) — mostrar a barra
 * incondicionalmente criaria flicker pro caso mais comum.
 */
export default function LoadingChecklistPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full items-center justify-center py-6">
        <div className="flex flex-col items-center gap-6 px-3 md:gap-10 md:px-8">
          <Skeleton variant="text" width={340} height={36} />

          <div className="w-full max-w-5xl">
            <Skeleton variant="rect" height={44} />

            <ul className="mt-2">
              {Array.from({ length: 8 }, (_, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 border-b border-border-default p-4"
                >
                  <Skeleton variant="text" width={32} />
                  <Skeleton variant="text" width={160} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
