export interface DeleteAnnouncementDialogProps {
  open?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}