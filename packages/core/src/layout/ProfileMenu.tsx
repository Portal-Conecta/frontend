'use client'

/**
 * ProfileMenu — dropdown do ícone de perfil do AppHeader (issue #328).
 * Específico deste shell (não é componente de DS — não há outro lugar no
 * produto onde esse menu se repita), por isso vive aqui em vez de
 * `packages/ui`. Âncora fixa no canto superior direito (mesmo alinhamento do
 * ícone de perfil no `AppHeader`), sem acoplar via ref ao organismo do DS.
 *
 * Nome e e-mail vêm de `GET /api/me`, buscado sob demanda na primeira
 * abertura (não no `AppShell`, que roda em toda página autenticada) — evita
 * pagar uma chamada `/me` extra em navegações que nunca abrem o menu. Cacheado
 * num módulo (não em estado do componente): o `AppShell` remonta a cada
 * navegação, mas o módulo persiste enquanto a aba não recarrega — cache vale
 * pro resto da sessão, não só pro mount atual.
 *
 * Fechar: clique fora (`pointerdown` fora do painel) ou `Esc` — via
 * `useFocusTrap`, mesmo hook do `ConfirmDialog`/`Sidebar`. O clique-fora
 * ignora o próprio gatilho (`[data-profile-trigger]` no `AppHeader`): sem
 * isso, o `pointerdown` do clique que reabre o menu é lido como "fora" e
 * fecha antes do `onClick` do botão rodar — o toggle nunca fecha.
 */
import { useEffect, useRef, useState } from 'react'

import { Icon, Text, useFocusTrap } from '@portal/ui'

import type { MyProfile } from '../profile/types'

export interface ProfileMenuProps {
  open: boolean
  onClose: () => void
  onNavigateProfile: () => void
  onLogout: () => void
}

let cachedProfile: MyProfile | null = null

/** Limpa o cache do módulo — chame no logout, senão o próximo login (mesma aba) herda nome/email do usuário anterior. */
export function clearProfileMenuCache() {
  cachedProfile = null
}

export function ProfileMenu({ open, onClose, onNavigateProfile, onLogout }: ProfileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<MyProfile | null>(cachedProfile)
  const [loadFailed, setLoadFailed] = useState(false)

  useFocusTrap(panelRef, { active: open, onClose })

  useEffect(() => {
    if (!open || cachedProfile) return
    let cancelled = false

    setLoadFailed(false)
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('load failed')
        return res.json() as Promise<MyProfile>
      })
      .then((data) => {
        if (cancelled) return
        cachedProfile = data
        setProfile(data)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-profile-trigger]')) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Menu de perfil"
      tabIndex={-1}
      className="fixed right-6 top-20 z-50 flex w-72 flex-col overflow-hidden rounded-md border-sm border-border-default bg-background-surface shadow-lg focus-visible:outline-none lg:right-10"
    >
      <div className="flex items-center gap-3 p-4">
        <Icon name="circle-user" size="lg" tone="primary" decorative />
        <div className="flex min-w-0 flex-col">
          <Text variant="label-md-emphasis" tone="brand" className="truncate">
            {loadFailed ? 'Meu perfil' : (profile?.name ?? '…')}
          </Text>
          {profile && (
            <Text variant="label-sm" tone="secondary" className="truncate">
              {profile.email}
            </Text>
          )}
        </div>
      </div>

      <button
        type="button"
        role="menuitem"
        onClick={onNavigateProfile}
        className="flex items-center gap-3 border-t border-border-default px-4 py-3 text-left text-text-secondary hover:bg-background-default hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Icon name="id-card" size="sm" decorative />
        <Text variant="label-sm" as="span">
          Meu perfil
        </Text>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={onLogout}
        className="flex items-center gap-3 border-t border-border-default px-4 py-3 text-left text-interactive-negative-default hover:bg-interactive-negative-subtle hover:text-interactive-negative-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-negative-focus-ring"
      >
        <Icon name="log-out" size="sm" decorative />
        <Text variant="label-sm" as="span">
          Sair
        </Text>
      </button>
    </div>
  )
}
