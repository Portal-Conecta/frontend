import { redirect } from "next/navigation";

import { getSession } from "@portal/core/auth/session";
import { getNotifications, NotificationsError } from "@portal/core/notifications/notificationService";
import type { NotificationStatus } from "@portal/core/notifications/types";

import { NotificationsList } from "./components/NotificationsList";
import { NotificationsFilters } from "./components/NotificationsFilters";
import { NotificationsPagination } from "./components/NotificationsPagination";
import { MarkAsReadOnView } from "./components/MarkAsReadOnView";

interface NotificationsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;
  const status: NotificationStatus = params.status === "read" ? "READ" : "UNREAD";
  const page = params.page ? Number(params.page) : 0;

  const accessToken = await getSession();
  if (!accessToken) {
    redirect("/login");
  }

  let data;
  try {
    data = await getNotifications(accessToken, { status, page });
  } catch (err) {
    if (err instanceof NotificationsError && err.kind === "unauthorized") {
      redirect("/login");
    }
    throw err;
  }

  const unreadIds = status === "UNREAD" ? data.content.map((n) => n.id) : [];

  return (
    <div>
      <h1>Notificação</h1>
      <NotificationsFilters activeStatus={status} />
      <NotificationsList notifications={data.content} />
      <NotificationsPagination
        page={data.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        size={data.size}
        status={status}
      />
      {unreadIds.length > 0 && <MarkAsReadOnView notificationIds={unreadIds} />}
    </div>
  );
}