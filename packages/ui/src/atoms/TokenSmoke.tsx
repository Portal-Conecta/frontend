/**
 * TokenSmoke — componente de validação do pipeline de tokens.
 *
 * Usa ao menos uma classe Tailwind de cada categoria de token para
 * confirmar que colors, spacing, typography, radius e borderWidth
 * estão corretamente registrados no tailwind.config.ts.
 *
 * Este componente pode ser removido após a configuração do CSS do
 * Storybook (postcss + globals.css com @import "tailwindcss") e a
 * validação visual estar confirmada em ambiente real.
 */
export function TokenSmoke() {
  return (
    <div className="bg-background-default p-8 font-inter">
      <h1 className="text-heading-h1 font-semibold text-text-primary mb-6">
        Token Smoke Test
      </h1>

      {/* Cores interativas */}
      <section className="mb-6">
        <p className="text-label-md font-semibold text-text-secondary mb-2">
          Interactive
        </p>
        <div className="flex gap-2">
          <div className="bg-interactive-default p-4 rounded-md text-text-inverse text-label-xs">
            default
          </div>
          <div className="bg-interactive-hover p-4 rounded-md text-text-inverse text-label-xs">
            hover
          </div>
          <div className="bg-interactive-pressed p-4 rounded-md text-text-inverse text-label-xs">
            pressed
          </div>
          <div className="bg-interactive-disabled p-4 rounded-md text-text-primary text-label-xs">
            disabled
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="mb-6">
        <p className="text-label-md font-semibold text-text-secondary mb-2">
          Feedback
        </p>
        <div className="flex gap-2">
          <div className="bg-feedback-success p-4 rounded-sm text-label-xs">success</div>
          <div className="bg-feedback-error   p-4 rounded-sm text-label-xs">error</div>
          <div className="bg-feedback-warning p-4 rounded-sm text-label-xs">warning</div>
          <div className="bg-feedback-info    p-4 rounded-sm text-label-xs">info</div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="mb-6">
        <p className="text-label-md font-semibold text-text-secondary mb-2">
          Typography
        </p>
        <p className="text-body-md font-afacad text-text-primary">
          body/md — Afacad Regular
        </p>
        <p className="text-body-sm font-afacad font-semibold text-text-primary">
          body/sm-emphasis — Afacad SemiBold
        </p>
        <p className="text-label-sm font-inter text-text-secondary">
          label/sm — Inter Regular
        </p>
      </section>

      {/* Bordas */}
      <section className="mb-6">
        <p className="text-label-md font-semibold text-text-secondary mb-2">
          Border + Radius
        </p>
        <div className="flex gap-3">
          <div className="border-sm border border-border-default p-4 rounded-sm text-label-xs text-text-primary">
            border-sm / rounded-sm
          </div>
          <div className="border-md border border-border-focus p-4 rounded-lg text-label-xs text-text-primary">
            border-md / rounded-lg
          </div>
          <div className="border-sm border border-border-error p-4 rounded-full text-label-xs text-text-primary">
            rounded-full
          </div>
        </div>
      </section>
    </div>
  )
}
