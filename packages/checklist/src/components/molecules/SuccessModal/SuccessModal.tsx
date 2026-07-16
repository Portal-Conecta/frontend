"use client";

import { Button } from "@portal/ui";

import { BaseFeedbackModal } from "../BaseFeedbackModal";

export interface SuccessModalProps {
  open?: boolean;
  message: string;
  confirmLabel?: string;
  onClose?: () => void;
}

export function SuccessModal({
  open = false,
  message,
  confirmLabel = "Ok!",
  onClose,
}: SuccessModalProps) {
  return (
    <BaseFeedbackModal open={open} message={message} onDismiss={onClose}>
      <Button variant="solid" size="sm" onClick={onClose} className="w-full">
        {confirmLabel}
      </Button>
    </BaseFeedbackModal>
  );
}
