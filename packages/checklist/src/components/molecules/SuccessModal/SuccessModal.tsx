'use client'

import { Button } from '@portal/ui'

import { BaseFeedbackModal } from '../BaseFeedbackModal'

export interface SuccessModalProps {
  open?: boolean
  message?: string
  confirmLabel?: string
  onClose?: () => void
}

const noop = () => {}

export function SuccessModal({
  open = false,
  message = '',
  confirmLabel = 'OK!',
  onClose = noop,
}: SuccessModalProps) {
  return (
    <BaseFeedbackModal open={open} message={message} onDismiss={onClose}>
      <Button variant="solid" onClick={onClose} className="w-full">
        {/* eslint-disable-next-line no-restricted-syntax -- tamanho fixo 12px sobrescrevendo o
        text-label-md-emphasis fixo do Button (16px). Ver AGENTS.md §Tokens, exceção pendente de aprovação do TL. */}
        <span style={{ fontSize: '12px', fontWeight: 400 }}>{confirmLabel}</span>
      </Button>
    </BaseFeedbackModal>
  )
}