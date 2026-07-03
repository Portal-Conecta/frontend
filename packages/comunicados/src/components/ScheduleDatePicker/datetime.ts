/**
 * Conversões puras entre o instante de agendamento (`scheduledFor`, ISO-8601 UTC
 * — ex.: `2026-06-30T14:00:00Z`) e os pares data/hora **locais** que os inputs
 * nativos (`type="date"` / `type="time"`) esperam. Sem React nem DOM, então são
 * cobertas por teste unitário e reusadas pelo `ScheduleDatePicker`.
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** `yyyy-mm-dd` local de uma `Date`. */
function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** `HH:mm` local de uma `Date`. */
function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** `yyyy-mm-dd` local do instante ISO — `''` quando ausente/inválido. */
export function isoToLocalDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : toDateInputValue(date)
}

/** `HH:mm` local do instante ISO — `''` quando ausente/inválido. */
export function isoToLocalTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : toTimeInputValue(date)
}

/**
 * Combina data (`yyyy-mm-dd`) e hora (`HH:mm`) locais num instante ISO-8601 UTC.
 * Retorna `null` enquanto um dos dois estiver vazio ou inválido — assim o campo
 * só emite valor quando o agendamento está completo.
 */
export function combineToIso(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  if ([year, month, day, hours, minutes].some((part) => part === undefined || Number.isNaN(part))) {
    return null
  }

  const local = new Date(year!, month! - 1, day!, hours!, minutes!, 0, 0)
  return Number.isNaN(local.getTime()) ? null : local.toISOString()
}

/** Data local de hoje (`yyyy-mm-dd`) — usada no atributo `min` do input de data. */
export function todayLocalDate(now: Date = new Date()): string {
  return toDateInputValue(now)
}

/** `true` quando o instante ISO está estritamente no futuro. */
export function isFutureIso(iso: string | null, now: number = Date.now()): boolean {
  if (!iso) return false
  const time = new Date(iso).getTime()
  return !Number.isNaN(time) && time > now
}
