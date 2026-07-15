"use client";

import { Icon, Text } from "@portal/ui";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    const focusable =
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable && focusable.length > 0) {
      focusable[0]?.focus();
    } else {
      dialogRef.current?.focus();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, onDismiss]);

  if (!open || !mounted) return null;

  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable =
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const messageId = message ? "base-feedback-modal-message" : undefined;

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
        onKeyDown={trapFocus}
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
