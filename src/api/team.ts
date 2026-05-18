import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Team management — members, invite, roles. */
export class Team {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List teams. */
  async list(): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/teams");
    return req.send(this.ctx, (j) => j);
  }

  /** Create a team. */
  async create(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/teams");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Get a team. */
  async get(id: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/teams/${id}`);
    return req.send(this.ctx, (j) => j);
  }

  /** Accept invite. */
  async acceptInvite(body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/teams/accept-invite");
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** Invite a member. */
  async invite(teamId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.POST, `/api/v1/teams/${teamId}/invite`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }

  /** List members. */
  async listMembers(teamId: string): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.GET, `/api/v1/teams/${teamId}/members`);
    return req.send(this.ctx, (j) => j);
  }

  /** Remove a member. */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/api/v1/teams/${teamId}/members/${userId}`);
    return req.sendNoResponseBody(this.ctx);
  }

  /** Change member role. */
  async changeRole(teamId: string, userId: string, body: Record<string, any>): Promise<any> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/api/v1/teams/${teamId}/members/${userId}/role`);
    req.setBody(body);
    return req.send(this.ctx, (j) => j);
  }
}
