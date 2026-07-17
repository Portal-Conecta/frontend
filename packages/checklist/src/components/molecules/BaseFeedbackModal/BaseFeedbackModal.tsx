"use client";

import { Icon, Text, useFocusTrap } from "@portal/ui";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type IconName = ComponentProps<typeof Icon>["name"];

export interface BaseFeedbackModalProps {
  open?: boolean;
  message?: string;
  onDismiss?: (() => void) | undefined;
  dismissible?: boolean;
  iconName?: IconName;
  iconClassName?: string;
  ariaLabel?: string | undefined;
  children: ReactNode;
}

export function BaseFeedbackModal({
  open = false,
  message,
  onDismiss,
  dismissible = true,
  iconName = "circle-check",
  iconClassName = "text-text-brand",
  ariaLabel,
  children,
}: BaseFeedbackModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const generatedId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useFocusTrap(dialogRef, {
    active: open && mounted,
    ...(dismissible && onDismiss ? { onClose: onDismiss } : {}),
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const messageId = message ? generatedId : undefined;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background-overlay p-4"
      onClick={dismissible ? onDismiss : undefined}
    >
      <div
        ref={dialogRef}
        role={dismissible ? "dialog" : "alertdialog"}
        aria-modal="true"
        aria-labelledby={messageId}
        aria-label={messageId ? undefined : ariaLabel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center gap-10 rounded-md bg-background-surface px-6 py-8 text-center shadow-xl outline-none"
      >
        <Icon
          name={iconName}
          decorative
          className={`${iconClassName} size-20`}
        />
        {message && (
          <Text
            id={messageId}
            variant="body-md"
            tone="brand"
            className="text-center"
          >
            {message}
          </Text>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
