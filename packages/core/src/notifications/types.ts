export type NotificationStatus = "READ" | "UNREAD";

export type NotificationType = "CHECKLIST" | "MAPA" | "COMUNICADO" | "OUTRO";

export interface Notification {
  id: string;
  notificationId: string;
  title: string;
  body: string;
  source: string;
  eventType: string;
  type: NotificationType;
  occurredAt: string;
  timestamp: string;
  readAt: string | null;
  read: boolean;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export interface PagedNotificationsResponse {
  content: Notification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetNotificationsParams {
  status: NotificationStatus;
  page?: number;
  size?: number;
}