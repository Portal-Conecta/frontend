import Link from "next/link";

import type { NotificationStatus } from "@portal/core/notifications/types";

interface NotificationsPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  status: NotificationStatus;
}

export function NotificationsPagination({
  page,
  totalPages,
  totalElements,
  size,
  status,
}: NotificationsPaginationProps) {
  const statusParam = status === "READ" ? "read" : "unread";
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  const hasPrevious = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <div>
      <span>
        {start}-{end} de {totalElements}
      </span>
      <div>
        {hasPrevious ? (
          <Link href={`/notifications?status=${statusParam}&page=${page - 1}`} aria-label="Página anterior">
            ‹
          </Link>
        ) : (
          <span aria-disabled="true">‹</span>
        )}
        {hasNext ? (
          <Link href={`/notifications?status=${statusParam}&page=${page + 1}`} aria-label="Próxima página">
            ›
          </Link>
        ) : (
          <span aria-disabled="true">›</span>
        )}
      </div>
    </div>
  );
}