"use client";

import { Button } from "@portal/ui";

import { BaseFeedbackModal } from "../BaseFeedbackModal";

export interface SuccessModalProps {
  open?: boolean;
  message?: string;
  confirmLabel?: string;
  onClose?: () => void;
}

export function SuccessModal({
  open = false,
  message = "",
  confirmLabel = "OK!",
  onClose,
}: SuccessModalProps) {
  return (
    <BaseFeedbackModal open={open} message={message} onDismiss={onClose}>
      {/* usar size do Button do DS em vez de sobrescrever a tipografia com valor cru */}
      <Button variant="solid" size="sm" onClick={onClose} className="w-full">
        {confirmLabel}
      </Button>
    </BaseFeedbackModal>
  );
}
