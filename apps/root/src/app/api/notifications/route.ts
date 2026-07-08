import { NextResponse } from "next/server";

import { getNotifications, NotificationsError, type NotificationsErrorKind } from "@portal/core/notifications/notificationService";
import { getSession } from "@portal/core/auth/session";
import type { NotificationStatus } from "@portal/core/notifications/types";

const STATUS_BY_KIND: Record<NotificationsErrorKind, number> = {
  unauthorized: 401,
  validation: 400,
  server: 503,
  network: 503,
};

export async function GET(req: Request) {
  const accessToken = await getSession();
  if (!accessToken) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as NotificationStatus | null;
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  if (!status) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  try {
    const data = await getNotifications(accessToken, {
  status,
  ...(page ? { page: Number(page) } : {}),
  ...(size ? { size: Number(size) } : {}),
});
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof NotificationsError) {
      return NextResponse.json({ code: err.kind }, { status: STATUS_BY_KIND[err.kind] });
    }
    return NextResponse.json({ code: "server" }, { status: 503 });
  }
}