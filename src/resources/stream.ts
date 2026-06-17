import type { HttpClient } from "../http-client";

export interface StreamChannel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface StreamMessage {
  id: string;
  channel_id: string;
  event: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface StreamSubscription {
  id: string;
  channel_id: string;
  endpoint_id: string;
  status: string;
  created_at: string;
}

export class StreamResource {
  constructor(private readonly http: HttpClient) {}

  async listChannels(): Promise<StreamChannel[]> {
    return this.http.request<StreamChannel[]>("GET", "/v1/stream/channels");
  }

  async createChannel(params: { name: string; description?: string }): Promise<StreamChannel> {
    return this.http.request<StreamChannel>("POST", "/v1/stream/channels", params);
  }

  async getChannel(channelId: string): Promise<StreamChannel> {
    return this.http.request<StreamChannel>("GET", `/stream/channels/${channelId}`);
  }

  async deleteChannel(channelId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/stream/channels/${channelId}`);
  }

  async listMessages(channelId: string): Promise<StreamMessage[]> {
    return this.http.request<StreamMessage[]>("GET", `/stream/channels/${channelId}/messages`);
  }

  async publish(params: { channel_id: string; event: string; data: Record<string, unknown> }): Promise<StreamMessage> {
    return this.http.request<StreamMessage>("POST", "/v1/stream/publish", params);
  }

  async listSubscriptions(): Promise<StreamSubscription[]> {
    return this.http.request<StreamSubscription[]>("GET", "/v1/stream/subscriptions");
  }

  async getSubscription(subscriptionId: string): Promise<StreamSubscription> {
    return this.http.request<StreamSubscription>("GET", `/stream/subscriptions/${subscriptionId}`);
  }

  async disconnectSubscription(subscriptionId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/stream/subscriptions/${subscriptionId}`);
  }

  /**
   * Get SSE event stream URL for deliveries.
   * Use with EventSource or similar SSE client.
   */
  getDeliveryStreamUrl(): string {
    return "/v1/stream/deliveries";
  }

  /**
   * Get SSE event stream URL for a channel.
   * Use with EventSource or similar SSE client.
   */
  getChannelStreamUrl(channelId: string): string {
    return `/stream/channels/${channelId}/subscribe`;
  }
}
