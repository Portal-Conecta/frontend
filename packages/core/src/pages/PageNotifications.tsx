import { redirect } from "next/navigation";

import { getSession } from "../auth/session";
import { MarkAsReadOnView } from "../notifications/components/MarkAsReadOnView";
import { NotificationsFilters } from "../notifications/components/NotificationsFilters";
import { NotificationsList } from "../notifications/components/NotificationsList";
import { NotificationsPagination } from "../notifications/components/NotificationsPagination";
import { getNotifications, NotificationsError } from "../notifications/notificationService";
import type { NotificationStatus } from "../notifications/types";

interface PageNotificationsProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export async function PageNotifications({ searchParams }: PageNotificationsProps) {
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