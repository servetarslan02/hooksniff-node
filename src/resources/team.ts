import type { HttpClient } from "../http-client";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  joined_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "expired";
  created_at: string;
}

export class TeamResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Team[]> {
    return this.http.request<Team[]>("GET", "/v1/teams");
  }

  async create(params: { name: string; description?: string }): Promise<Team> {
    return this.http.request<Team>("POST", "/v1/teams", params);
  }

  async get(teamId: string): Promise<Team> {
    return this.http.request<Team>("GET", `/v1/teams/${teamId}`);
  }

  async update(teamId: string, params: { name?: string; description?: string }): Promise<Team> {
    return this.http.request<Team>("PUT", `/v1/teams/${teamId}`, params);
  }

  async delete(teamId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/teams/${teamId}`);
  }

  async listMembers(teamId: string): Promise<TeamMember[]> {
    return this.http.request<TeamMember[]>("GET", `/v1/teams/${teamId}/members`);
  }

  async inviteMember(teamId: string, params: { email: string; role: "admin" | "editor" | "viewer" }): Promise<TeamInvite> {
    return this.http.request<TeamInvite>("POST", `/v1/teams/${teamId}/members`, params);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.http.request<void>("DELETE", `/v1/teams/${teamId}/members/${userId}`);
  }

  async updateMemberRole(teamId: string, userId: string, role: "admin" | "editor" | "viewer"): Promise<TeamMember> {
    return this.http.request<TeamMember>("PUT", `/v1/teams/${teamId}/members/${userId}`, { role });
  }
}
