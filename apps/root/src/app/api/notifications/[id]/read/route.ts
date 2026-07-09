import { NextResponse } from "next/server";

import { markNotificationAsRead, NotificationsError, type NotificationsErrorKind } from "@portal/core/notifications/notificationService";
import { getSession } from "@portal/core/auth/session";

const STATUS_BY_KIND: Record<NotificationsErrorKind, number> = {
  unauthorized: 401,
  validation: 400,
  server: 503,
  network: 503,
};

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getSession();
  if (!accessToken) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await markNotificationAsRead(accessToken, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof NotificationsError) {
      return NextResponse.json({ code: err.kind }, { status: STATUS_BY_KIND[err.kind] });
    }
    return NextResponse.json({ code: "server" }, { status: 503 });
  }
}