"use client";

import { useEffect, useRef } from "react";

interface MarkAsReadOnViewProps {
  notificationIds: string[];
}

async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  if (!res.ok) {
    throw new Error(`Falha ao marcar notificação ${id} como lida: ${res.status}`);
  }
}

export function MarkAsReadOnView({ notificationIds }: MarkAsReadOnViewProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || notificationIds.length === 0) {
      return;
    }
    hasFired.current = true;

    Promise.allSettled(notificationIds.map(markAsRead)).then((results) => {
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error(`Falha ao marcar ${failed.length} notificação(ões) como lida(s).`);
      }
    });
  }, [notificationIds]);

  return null;
}