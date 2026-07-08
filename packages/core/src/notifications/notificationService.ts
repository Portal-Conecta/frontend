/**
 * notificationService — notificações contra o back-end.
 *
 * Lógica pura: sem React, sem `next/headers`. Roda no server (chamado pelo
 * Route Handler `/api/notifications`), onde a URL do back vive em `API_URL`
 * (privada, server-side). Testável com Vitest mockando `fetch`.
 */

import type { GetNotificationsParams, PagedNotificationsResponse } from "./types";

export type NotificationsErrorKind = "unauthorized" | "validation" | "server" | "network";

export class NotificationsError extends Error {
  constructor(public readonly kind: NotificationsErrorKind, message?: string) {
    super(message ?? kind);
    this.name = "NotificationsError";
  }
}

function baseUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new NotificationsError("server", "API_URL não configurada");
  }
  return url;
}

export async function getNotifications(
  accessToken: string,
  params: GetNotificationsParams
): Promise<PagedNotificationsResponse> {
  const searchParams = new URLSearchParams({
    status: params.status,
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });

  const url = `${baseUrl()}/notifications?${searchParams.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    throw new NotificationsError("network");
  }

  if (res.ok) {
    try {
      return (await res.json()) as PagedNotificationsResponse;
    } catch {
      throw new NotificationsError("server");
    }
  }

  if (res.status === 401) throw new NotificationsError("unauthorized");
  if (res.status === 400) throw new NotificationsError("validation");
  throw new NotificationsError("server");
}