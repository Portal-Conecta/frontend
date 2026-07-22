'use client'

/**
 * Importação de usuários por planilha (#441) — sem desenho no Figma, fluxo
 * definido a partir do que o `core-backend` já suporta (`dryRun`): 1) escolhe
 * arquivo + política pra e-mail existente, 2) "Analisar" roda em `dryRun`
 * (nada é criado, só valida linha a linha), 3) confere o resumo/linhas com
 * erro e só então "Confirmar importação" roda de verdade.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Banner, Button, Select, Text, useFocusTrap, type SelectOption } from '@portal/ui'

import { HttpError } from '../http/errors'
import type { ExistingEmailHandling, UserImportResult } from './types'
import { importUsersClient, USER_IMPORT_TEMPLATE_URL } from './usersImportClient'

export interface ImportUsersModalProps {
  open: boolean
  onClose: () => void
}

const ON_EXISTING_OPTIONS: SelectOption[] = [
  { value: 'REJECT', label: 'Rejeitar a linha' },
  { value: 'SKIP', label: 'Ignorar e pular a linha' },
]

function genericErrorMessage(err: unknown): string {
  return err instanceof HttpError && err.body?.message ? err.body.message : 'Não foi possível processar a planilha.'
}

export function ImportUsersModal({ open, onClose }: ImportUsersModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [mounted, setMounted] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [onExisting, setOnExisting] = useState<ExistingEmailHandling>('REJECT')
  const [result, setResult] = useState<UserImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useFocusTrap(panelRef, { active: open, onClose: handleClose })

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function reset() {
    setFile(null)
    setResult(null)
    setError(null)
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleAnalyze() {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    try {
      setResult(await importUsersClient(file, { onExisting, dryRun: true }))
    } catch (err) {
      setError(genericErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    try {
      setResult(await importUsersClient(file, { onExisting, dryRun: false }))
    } catch (err) {
      setError(genericErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!open || !mounted) return null

  const previewed = result !== null && result.dryRun
  const imported = result !== null && !result.dryRun
  const hasErrors = result ? result.rows.some((row) => row.status === 'ERROR') : false

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-overlay" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-md border-sm border-border-default bg-background-surface p-8"
      >
        <Text as="h2" variant="heading-h2" tone="brand" id={titleId}>
          Importar usuários por planilha
        </Text>

        {!result && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <a href={USER_IMPORT_TEMPLATE_URL} className="text-body-sm-emphasis text-text-brand underline">
                Baixar modelo (CSV)
              </a>
              <Text variant="label-xs" tone="secondary">
                Se abrir tudo numa coluna só no Excel/Sheets, escolha "vírgula" como separador ao importar.
              </Text>
            </div>

            <input
              type="file"
              accept=".csv,.xlsx"
              aria-label="Selecionar planilha de usuários"
              disabled={loading}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="text-label-sm text-text-secondary file:mr-3 file:rounded-md file:border-sm file:border-border-default file:bg-background-surface file:px-3 file:py-2 file:text-label-xs"
            />

            <div className="flex flex-col gap-2">
              <Text variant="label-sm-emphasis" tone="brand">
                Se o e-mail já existir
              </Text>
              <Select
                options={ON_EXISTING_OPTIONS}
                value={onExisting}
                onChange={(value) => setOnExisting((value as ExistingEmailHandling) ?? 'REJECT')}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {error && <Banner variant="error">{error}</Banner>}

        {result && (
          <div className="flex flex-col gap-3">
            <Banner variant={hasErrors ? 'error' : 'info'}>
              {previewed
                ? `Prévia: ${result.created} linha(s) válida(s), ${result.skipped} ignorada(s), ${result.rows.filter((r) => r.status === 'ERROR').length} com erro.`
                : `Importação concluída: ${result.created} criado(s), ${result.skipped} ignorado(s), ${result.rows.filter((r) => r.status === 'ERROR').length} com erro.`}
            </Banner>

            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border-sm border-border-default p-2">
              {result.rows.map((row) => (
                <div key={row.line} className="flex items-start gap-2 text-label-xs">
                  <Text as="span" variant="label-xs" tone="secondary">
                    L{row.line}
                  </Text>
                  <Text
                    as="span"
                    variant="label-xs"
                    tone={row.status === 'ERROR' ? 'secondary' : 'brand'}
                    className={row.status === 'ERROR' ? 'text-feedback-error' : undefined}
                  >
                    {row.message}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outlined" tone="brand" className="flex-1" disabled={loading} onClick={handleClose}>
            {imported ? 'Concluir' : 'Cancelar'}
          </Button>

          {!result && (
            <Button
              className="flex-1"
              tone="brand"
              disabled={!file || loading}
              loading={loading}
              onClick={() => void handleAnalyze()}
            >
              Analisar planilha
            </Button>
          )}

          {previewed && (
            <Button
              className="flex-1"
              tone="brand"
              disabled={loading || result.created === 0}
              loading={loading}
              onClick={() => void handleConfirm()}
            >
              Confirmar importação
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ImportUsersModal
