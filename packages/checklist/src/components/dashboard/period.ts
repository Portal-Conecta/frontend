/** Data local yyyy-MM-dd (evita off-by-one do toISOString em UTC). */
export function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Últimos `days` dias até hoje (inclusive no fim). */
export function defaultDashboardPeriod(days = 30): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - days)
  return { from: toLocalIsoDate(from), to: toLocalIsoDate(to) }
}

/** Formata ISO yyyy-MM-dd para exibição pt-BR. */
export function formatIsoDatePt(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export type PeriodValidation =
  | { ok: true }
  | { ok: false; message: string }

export function validateDashboardPeriod(from: string, to: string): PeriodValidation {
  if (!from || !to) {
    return { ok: false, message: 'Informe as duas datas do intervalo.' }
  }
  if (from > to) {
    return { ok: false, message: "A data 'De' não pode ser posterior a 'Até'." }
  }
  const today = toLocalIsoDate(new Date())
  if (to > today) {
    return { ok: false, message: 'O fim do intervalo não pode estar no futuro.' }
  }
  return { ok: true }
}
