'use client'

import { Button, Icon, Text } from '@portal/ui'
import { useEffect } from 'react'
import type { DeleteAnnouncementDialogProps } from 'src/types/delete-announcement-dialog'

export function DeleteAnnouncementDialog({
  open = false,
  title = 'Deseja Deletar\nesse comunicado?',
  description = 'Esta ação não pode ser desfeita. Deseja continuar?',
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  onConfirm = () => {},
  onCancel = () => {},
  onClose,
}: DeleteAnnouncementDialogProps) {
  const dismiss = onClose ?? onCancel

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  const titleLines = title.split('\n')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title.replace(/\n/g, ' ')}
        onClick={(e) => e.stopPropagation()}
        // eslint-disable-next-line no-restricted-syntax -- padding e dimensões fluidas fora da escala: card 289×417 (mobile) → 462×667 (desktop); padding-x 20px → 60px alinhado ao MESMO intervalo de crescimento do card (722px→1155px) para não espremer o conteúdo enquanto a largura está travada no mínimo. Ver AGENTS.md Tokens, exceção pendente de aprovação do TL.
        className="relative flex flex-col items-center justify-center rounded-md bg-background-surface py-[20px] shadow-xl lg:py-4"
        style={{
          width: 'clamp(289px, 40vw, 462px)',
          height: 'clamp(417px, 58vw, 667px)',
          paddingLeft: 'clamp(20px, calc(20px + (100vw - 722.5px) * 0.0925), 60px)',
          paddingRight: 'clamp(20px, calc(20px + (100vw - 722.5px) * 0.0925), 60px)',
        }}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={dismiss}
          className="absolute right-4 top-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <Icon name="x" size="md" tone="secondary" decorative />
        </button>

        <div className="flex w-full flex-col items-center gap-7 text-center">
          <Icon
            name="circle-help"
            size="lg"
            decorative
            className="text-text-brand"
            // eslint-disable-next-line no-restricted-syntax -- tamanho (46px→64px) fora do controle padrão do Icon; por spec de Design. Ver AGENTS.md Tokens, exceção pendente de aprovação do TL.
            style={{
              width: 'clamp(46px, 5vw, 64px)',
              height: 'clamp(46px, 5vw, 64px)',
              strokeWidth: 2,
            }}
          />

          <Text
            variant="body-xl-emphasis"
            tone="primary"
            className="text-center font-inter"
            // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (24px → 32px). Ver AGENTS.md Tokens, exceção pendente de aprovação do TL.
            style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}
          >
            {titleLines.map((line, i) => (
              <span key={i} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </Text>

          <Text
            variant="body-sm"
            tone="secondary"
            className="text-center font-inter"
            // eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (14px → 18px). Ver AGENTS.md Tokens, exceção pendente de aprovação do TL.
            style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }}
          >
            {description}
          </Text>

          <div
            className="flex w-full flex-col gap-2"
            // eslint-disable-next-line no-restricted-syntax -- margin-top fluido fora da escala (24px → 92px); slope (92-24)/432.5. Ver AGENTS.md Tokens, exceção pendente de aprovação do TL.
            style={{ marginTop: 'clamp(8px, calc(8px + (100vw - 722.5px) * 0.0925), 48px)' }}
          >
            <Button variant="solid" tone="brand" fullWidth onClick={onConfirm}>
              {/* eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (12px → 16px) sobre o text-label-md-emphasis fixo do Button. Ver AGENTS.md Tokens, exceção pendente de aprovação do TL. */}
              <span style={{ fontSize: 'clamp(12px, 1.2vw, 16px)' }}>{confirmLabel}</span>
            </Button>
            <Button variant="outlined" tone="negative" fullWidth onClick={onCancel}>
              {/* eslint-disable-next-line no-restricted-syntax -- clamp responsivo intencional (12px → 16px) sobre o text-label-md-emphasis fixo do Button. Ver AGENTS.md Tokens, exceção pendente de aprovação do TL. */}
              <span style={{ fontSize: 'clamp(12px, 1.2vw, 16px)' }}>{cancelLabel}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}