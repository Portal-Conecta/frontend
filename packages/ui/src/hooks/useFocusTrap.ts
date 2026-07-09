
'use client'

/**
 * useFocusTrap — lógica de acessibilidade para camadas sobrepostas (modal,
 * drawer, popover): prende o foco do teclado dentro de um painel enquanto ele
 * está ativo e devolve o foco ao gatilho quando fecha.
 *
 * Não desenha nada — é só comportamento. O componente dono do painel (ex.:
 * `Modal`) passa o `ref` do container e um sinal `active`; o hook cuida do
 * resto: foca o painel ao abrir, faz o `Tab`/`Shift+Tab` circularem entre os
 * focáveis, chama `onClose` no `Esc` e restaura o foco anterior ao desmontar.
 *
 * Extraído do focus-trap inline da `Sidebar` (dívida #105) para isolar a a11y
 * do layout e permitir reuso e teste.
 */
import { useEffect, useRef, type RefObject } from 'react'

export interface UseFocusTrapOptions {
  /** Quando `true`, ativa o trap (foca o painel, prende o Tab, escuta o Esc). */
  active: boolean
  /** Chamado ao pressionar `Esc` — normalmente fecha a camada. */
  onClose?: () => void
}

/** Seletor dos elementos que podem receber foco dentro do painel. */
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<T extends HTMLElement>(
  panelRef: RefObject<T | null>,
  { active, onClose }: UseFocusTrapOptions,
) {
  // `onClose` num ref: o efeito depende só de `active`. Sem isso, um `onClose`
  // recriado a cada render do pai re-rodaria o efeito com a camada aberta —
  // roubando o foco e sobrescrevendo o foco anterior guardado.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return

    const panel = panelRef.current
    if (!panel) return

    const previousFocus = document.activeElement as HTMLElement | null
    panel.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [active, panelRef])
}
