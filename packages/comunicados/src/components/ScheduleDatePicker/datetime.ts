/**
 * Conversões puras entre o instante de agendamento (`scheduledFor`, ISO-8601 UTC
 * — ex.: `2026-06-30T17:00:00Z`) e os pares data/hora no fuso de **Brasília**
 * (`America/Sao_Paulo`) que os inputs nativos (`type="date"` / `type="time"`)
 * exibem. Sem React nem DOM — cobertas por teste unitário e reusadas pelo
 * `ScheduleDatePicker`.
 */

/** Fuso do horário de Brasília (BRT, UTC−3 — sem horário de verão desde 2019). */
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** `yyyy-mm-dd` no fuso de Brasília. */
export function formatBrasiliaDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BRASILIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** `HH:mm` no fuso de Brasília. */
export function formatBrasiliaTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BRASILIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

/** Soma dias a um `yyyy-mm-dd` (calendário civil, sem fuso). */
function addDaysToDateInput(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(year!, month! - 1, day! + days))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

/**
 * Meia-noite do dia seguinte em Brasília — default ao escolher "Agendar publicação".
 * Evita erro de validação (instante sempre no futuro).
 */
export function defaultScheduleBrasilia(now: Date = new Date()): { date: string; time: string } {
  return {
    date: addDaysToDateInput(formatBrasiliaDate(now), 1),
    time: '00:00',
  }
}

/**
 * Preenche data/hora vazias com meia-noite de amanhã em Brasília.
 * Mantém valores já digitados quando só um dos campos está preenchido.
 */
export function resolveScheduleDefaults(
  dateStr: string,
  timeStr: string,
  now: Date = new Date(),
): { date: string; time: string } {
  if (dateStr && timeStr) return { date: dateStr, time: timeStr }
  const defaults = defaultScheduleBrasilia(now)
  return {
    date: dateStr || defaults.date,
    time: timeStr || defaults.time,
  }
}

/** `yyyy-mm-dd` em Brasília do instante ISO — `''` quando ausente/inválido. */
export function isoToLocalDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : formatBrasiliaDate(date)
}

/** `HH:mm` em Brasília do instante ISO — `''` quando ausente/inválido. */
export function isoToLocalTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : formatBrasiliaTime(date)
}

/**
 * Combina data (`yyyy-mm-dd`) e hora (`HH:mm`) **em Brasília** num instante
 * ISO-8601 UTC. Retorna `null` enquanto um dos dois estiver vazio ou inválido.
 */
export function combineToIso(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  if ([year, month, day, hours, minutes].some((part) => part === undefined || Number.isNaN(part))) {
    return null
  }

  // Interpreta o par data/hora como horário de Brasília (BRT = UTC−3).
  const withOffset = `${year}-${pad(month!)}-${pad(day!)}T${pad(hours!)}:${pad(minutes!)}:00-03:00`
  const instant = new Date(withOffset)
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString()
}

/**
 * Início (`00:00:00.000`) ou fim (`23:59:59.999`) do dia civil em Brasília,
 * como ISO-8601 UTC — usado nos filtros `publishedFrom` / `publishedTo` do mural.
 */
export function brasiliaDayBoundaryIso(dateStr: string, endOfDay: boolean): string | null {
  if (!dateStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null

  const time = endOfDay ? '23:59:59.999' : '00:00:00.000'
  const withOffset = `${year}-${pad(month)}-${pad(day)}T${time}-03:00`
  const instant = new Date(withOffset)
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString()
}

/** Soma dias a um `yyyy-mm-dd` (calendário civil). Exportado para filtros do mural. */
export function addCalendarDays(dateStr: string, days: number): string {
  return addDaysToDateInput(dateStr, days)
}

/** Data de hoje em Brasília (`yyyy-mm-dd`) — usada no atributo `min` do input de data. */
export function todayLocalDate(now: Date = new Date()): string {
  return formatBrasiliaDate(now)
}

/** `true` quando o instante ISO está estritamente no futuro. */
export function isFutureIso(iso: string | null, now: number = Date.now()): boolean {
  if (!iso) return false
  const time = new Date(iso).getTime()
  return !Number.isNaN(time) && time > now
}
