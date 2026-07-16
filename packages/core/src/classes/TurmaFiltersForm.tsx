'use client'

/**
 * TurmaFiltersForm — os campos de filtro de Turmas (Curso, Turno + Restaurar/
 * Aplicar). Fonte única reusada pela coluna lateral no desktop e pelo
 * `TurmaFiltersSheet` no mobile, para os dois não divergirem.
 */
import { Button, Field, Input, Text } from '@portal/ui'

export interface TurmaFiltersFormProps {
  /** Id do título — liga o heading ao `aria-labelledby` do dialog (sheet). */
  titleId?: string
  /** Aplicar filtros. No sheet, também fecha. */
  onApply?: () => void
  /** Restaurar filtros ao padrão. */
  onReset?: () => void
}

export function TurmaFiltersForm({
  titleId,
  onApply = () => {},
  onReset = () => {},
}: TurmaFiltersFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <Text {...(titleId ? { id: titleId } : {})} variant="heading-h3" tone="brand">
        Filtros
      </Text>

      <Field label="Curso">
        <Input placeholder="Todos" />
      </Field>
      <Field label="Turno">
        <Input placeholder="Todos" />
      </Field>

      <div className="flex gap-3">
        <Button fullWidth variant="outlined" size='xs' onClick={onReset}>
          Restaurar
        </Button>
        <Button fullWidth size='xs' onClick={onApply}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}
