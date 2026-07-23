import { Icon, Skeleton, Text } from '@portal/ui'

/**
 * AnnouncementWizardFallback — skeleton do conteúdo de `/comunicados/criar` e
 * `/comunicados/[id]/editar` (#518), usado pelo `loading.tsx` de cada rota.
 * `CreateAnnouncementWizard` e `EditAnnouncementWizard` compartilham a mesma
 * casca (link de volta + título + card com a etapa 1 do wizard + nav/progresso)
 * — só o texto do link/título muda entre criar e editar — daí o componente
 * único, mesmo motivo do `MuralContentFallback` em comunicados.
 */
export interface AnnouncementWizardFallbackProps {
  backLabel: string
  title: string
  loadingLabel: string
}

export function AnnouncementWizardFallback({ backLabel, title, loadingLabel }: AnnouncementWizardFallbackProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-8" role="status" aria-live="polite">
      <span className="sr-only">{loadingLabel}</span>

      <span className="inline-flex w-fit items-center gap-2 text-interactive-default">
        <Icon name="chevrons-left" size="sm" decorative />
        <Text as="span" variant="label-md-emphasis">
          {backLabel}
        </Text>
      </span>

      <Text as="h1" variant="heading-h2" tone="brand">
        {title}
      </Text>

      <div className="flex flex-col gap-6 rounded-md border-sm border-border-default bg-background-surface p-6 md:p-8">
        <Skeleton variant="rect" height={160} />

        <div className="flex flex-col gap-2">
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="rect" height={44} />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton variant="text" width={160} height={16} />
          <Skeleton variant="rect" height={204} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div />
        <Skeleton variant="rect" width={120} height={44} />
      </div>

      <div className="flex w-full gap-2">
        <Skeleton variant="rect" height={4} className="flex-1" />
        <Skeleton variant="rect" height={4} className="flex-1" />
        <Skeleton variant="rect" height={4} className="flex-1" />
      </div>
    </div>
  )
}

export default AnnouncementWizardFallback
