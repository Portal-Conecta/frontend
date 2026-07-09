import Link from "next/link";

import type { NotificationStatus } from "@portal/core/notifications/types";

interface NotificationsFiltersProps {
  activeStatus: NotificationStatus;
}

export function NotificationsFilters({ activeStatus }: NotificationsFiltersProps) {
  return (
    <nav>
      <Link href="/notifications?status=unread" aria-current={activeStatus === "UNREAD" ? "page" : undefined}>
        Não Lidas
      </Link>
      <Link href="/notifications?status=read" aria-current={activeStatus === "READ" ? "page" : undefined}>
        Lidas
      </Link>
    </nav>
  );
}