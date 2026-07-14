/**
 * Utilitários puros de data. Convertem entradas locais do usuário (`yyyy-mm-dd`,
 * limites de dia) em ISO (UTC) para os parâmetros de busca do BFF.
 */

export type DayBoundary = 'start' | 'end'

const BOUNDARY_TIME: Record<DayBoundary, string> = {
  start: '00:00:00.000',
  end: '23:59:59.999',
}

/** `yyyy-mm-dd` no limite do dia local → ISO (UTC). Valor inválido volta como veio. */
export function toDayBoundaryIso(dateStr: string, boundary: DayBoundary): string {
  const date = new Date(`${dateStr}T${BOUNDARY_TIME[boundary]}`)
  return Number.isNaN(date.getTime()) ? dateStr : date.toISOString()
}

/** Início do dia local (00:00) numa cópia de `date`. */
export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Fim do dia local (23:59:59.999) numa cópia de `date`. */
export function endOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}
