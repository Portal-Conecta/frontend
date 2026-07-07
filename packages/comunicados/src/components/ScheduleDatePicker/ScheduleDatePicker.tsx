'use client'

/**
 * ScheduleDatePicker — seção "Publicar agora / Agendar publicação" do fluxo de
 * criar comunicado.
 *
 * Compõe controles do DS: um `RadioGroup` (publicar agora × agendar) e, ao
 * escolher agendar, os átomos `DateInput` + `TimeInput` (data + hora). Espelha
 * o design "Agendar publicação" (opção selecionada + subtítulo + campos
 * rotulados).
 *
 * Controlado por um único `value` ISO-8601 UTC (`scheduledFor`): `null` =
 * publicar agora (opção "Publicar agora", campos ocultos). Internamente quebra o
 * instante em data/hora **de Brasília** para os inputs nativos e recombina em UTC no
 * `onChange`. Valida no client que o instante escolhido está no futuro; o
 * backend continua sendo a fonte da verdade.
 */
import { useEffect, useId, useRef, useState } from 'react'

import { DateInput, RadioGroup, Text, TimeInput } from '@portal/ui'

import { combineToIso, isFutureIso, isoToLocalDate, isoToLocalTime, resolveScheduleDefaults, todayLocalDate } from './datetime'

const MODE_NOW = 'now'
const MODE_SCHEDULE = 'schedule'

const MODE_OPTIONS = [
  { value: MODE_NOW, label: 'Publicar agora' },
  { value: MODE_SCHEDULE, label: 'Agendar publicação' },
]

export interface ScheduleDatePickerProps {
  /** Instante de agendamento em ISO-8601 UTC (`scheduledFor`), ou `null` para publicar agora. */
  value: string | null
  /** Recebe o ISO-8601 UTC completo, ou `null` (publicar agora / agendamento incompleto). */
  onChange: (isoUtc: string | null) => void
  /** Erro externo (ex.: backend). Tem precedência sobre o aviso de data no passado. */
  error?: string
  disabled?: boolean
  /** Só para layout externo. */
  className?: string
}

export function ScheduleDatePicker({
  value,
  onChange,
  error,
  disabled = false,
  className,
}: ScheduleDatePickerProps) {
  const baseId = useId()
  const dateId = `${baseId}-date`
  const timeId = `${baseId}-time`
  const errorId = `${baseId}-error`

  const [enabled, setEnabled] = useState(() => value != null)
  const [dateStr, setDateStr] = useState(() => isoToLocalDate(value))
  const [timeStr, setTimeStr] = useState(() => isoToLocalTime(value))
  // Último valor emitido: distingue mudança externa (reset/edição pelo pai) de
  // eco do nosso próprio onChange, sem sobrescrever entrada parcial do usuário.
  const lastEmitted = useRef(value)

  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    setEnabled(value != null)
    setDateStr(isoToLocalDate(value))
    setTimeStr(isoToLocalTime(value))
  }, [value])

  function emit(nextEnabled: boolean, nextDate: string, nextTime: string) {
    const iso = nextEnabled ? combineToIso(nextDate, nextTime) : null
    lastEmitted.current = iso
    onChange(iso)
  }

  function handleMode(mode: string) {
    const next = mode === MODE_SCHEDULE
    setEnabled(next)

    const resolved = next ? resolveScheduleDefaults(dateStr, timeStr) : { date: dateStr, time: timeStr }
    if (next) {
      setDateStr(resolved.date)
      setTimeStr(resolved.time)
    }

    emit(next, resolved.date, resolved.time)
  }

  function handleDate(next: string) {
    setDateStr(next)
    emit(enabled, next, timeStr)
  }

  function handleTime(next: string) {
    setTimeStr(next)
    emit(enabled, dateStr, next)
  }

  const iso = enabled ? combineToIso(dateStr, timeStr) : null
  const pastError = !error && iso && !isFutureIso(iso) ? 'A data e a hora devem estar no futuro.' : undefined
  const shownError = error ?? pastError
  const invalid = Boolean(shownError)

  return (
    <section className={className ? `flex flex-col gap-3 ${className}` : 'flex flex-col gap-3'}>
      <RadioGroup
        value={enabled ? MODE_SCHEDULE : MODE_NOW}
        onChange={handleMode}
        options={MODE_OPTIONS}
        disabled={disabled}
        aria-label="Quando publicar o comunicado"
      />

      {enabled ? (
        <>
          <Text as="p" variant="body-sm" tone="secondary">
            Escolha a data e hora para publicar o comunicado
          </Text>

          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-2">
              <Text as="label" htmlFor={dateId} variant="label-sm-emphasis" tone="brand">
                Data de publicação
              </Text>
              <DateInput
                id={dateId}
                value={dateStr}
                onChange={handleDate}
                min={todayLocalDate()}
                disabled={disabled}
                invalid={invalid}
                aria-describedby={shownError ? errorId : undefined}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Text as="label" htmlFor={timeId} variant="label-sm-emphasis" tone="brand">
                Horário de publicação
              </Text>
              <TimeInput
                id={timeId}
                value={timeStr}
                onChange={handleTime}
                disabled={disabled}
                invalid={invalid}
                aria-describedby={shownError ? errorId : undefined}
              />
            </div>
          </div>

          {shownError ? (
            <div id={errorId} role="alert" className="flex items-center gap-2">
              <span aria-hidden="true" className="h-[15px] w-[3px] shrink-0 rounded-sm bg-feedback-error" />
              <span className="text-label-xs font-inter text-feedback-error">{shownError}</span>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
