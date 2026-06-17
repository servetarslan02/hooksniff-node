import type { HttpClient } from "../http-client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  status: "draft" | "sent" | "scheduled";
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export class NotificationResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { page?: number; per_page?: number }): Promise<{ notifications: Notification[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    const qs = query.toString();
    return this.http.request("GET", `/v1/notifications${qs ? `?${qs}` : ""}`);
  }

  async markRead(notificationId: string): Promise<void> {
    await this.http.request<void>("POST", `/v1/notifications/${notificationId}/read`);
  }

  async markAllRead(): Promise<void> {
    await this.http.request<void>("POST", "/v1/notifications/read-all");
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await this.http.request<{ unread_count: number }>("GET", "/v1/notifications/unread-count");
    return { count: response.unread_count };
  }
}

export class BroadcastResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Broadcast[]> {
    return this.http.request<Broadcast[]>("GET", "/v1/broadcasts");
  }

  async create(params: { title: string; message: string; scheduled_at?: string }): Promise<Broadcast> {
    return this.http.request<Broadcast>("POST", "/v1/broadcasts", params);
  }

  async get(broadcastId: string): Promise<Broadcast> {
    return this.http.request<Broadcast>("GET", `/v1/broadcasts/${broadcastId}`);
  }

  async delete(broadcastId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/broadcasts/${broadcastId}`);
  }

  async send(broadcastId: string): Promise<void> {
    await this.http.request<void>("POST", `/v1/broadcasts/${broadcastId}/send`);
  }
}
