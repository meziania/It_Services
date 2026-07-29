import type {
  HealthResponse,
  MessageTemplate,
  Offer,
  OfferStatus,
  Platform,
  PlatformSourceDto,
  Role,
  ScoringWeights,
  ServiceEntry,
  TeamMember,
  TeamSettings,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * /health is @Public() on the API — safe to call directly from the browser,
 * no auth needed (used by the client-side HealthPill component).
 */
export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return safeJson<HealthResponse>(res);
  } catch {
    return null;
  }
}

/**
 * Client-invoked mutations go through same-origin Next.js route handlers
 * (app/api/...) instead of hitting the NestJS API directly, so the httpOnly
 * session cookie can be read server-side and forwarded as a Bearer token.
 */
export async function updateOfferStatus(id: string, status: OfferStatus): Promise<Offer | null> {
  try {
    const res = await fetch(`/api/offers/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return safeJson<Offer>(res);
  } catch {
    return null;
  }
}

export async function createTeamMember(
  email: string,
  password: string,
  role: Role = "MEMBER",
): Promise<{ ok: boolean; message?: string; user?: TeamMember }> {
  try {
    const res = await fetch(`/api/auth/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await safeJson<TeamMember & { message?: string }>(res);
    if (!res.ok) return { ok: false, message: data?.message ?? `HTTP ${res.status}` };
    return { ok: true, user: data ?? undefined };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function runSource(id: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/sources/${id}/run`, { method: "POST" });
    if (!res.ok) {
      const body = await safeJson<{ message?: string }>(res);
      return { ok: false, message: body?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

interface SourceInput {
  platform: Platform;
  name: string;
  baseUrl?: string;
  frequencyMinutes?: number;
  maxPages?: number;
  keywords?: string[];
  active?: boolean;
}

async function mutateResult<T>(
  res: Response,
): Promise<{ ok: boolean; message?: string; data?: T }> {
  const body = await safeJson<T & { message?: string }>(res);
  if (!res.ok) return { ok: false, message: (body as { message?: string } | null)?.message ?? `HTTP ${res.status}` };
  return { ok: true, data: body ?? undefined };
}

export async function createSource(
  input: SourceInput,
): Promise<{ ok: boolean; message?: string; data?: PlatformSourceDto }> {
  try {
    const res = await fetch(`/api/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return await mutateResult<PlatformSourceDto>(res);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateSource(
  id: string,
  input: Partial<SourceInput>,
): Promise<{ ok: boolean; message?: string; data?: PlatformSourceDto }> {
  try {
    const res = await fetch(`/api/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return await mutateResult<PlatformSourceDto>(res);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteSource(id: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await safeJson<{ message?: string }>(res);
      return { ok: false, message: body?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateSettings(input: {
  skills?: string[];
  services?: ServiceEntry[];
  weights?: ScoringWeights;
  template?: MessageTemplate;
}): Promise<{ ok: boolean; message?: string; data?: TeamSettings }> {
  try {
    const res = await fetch(`/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return await mutateResult<TeamSettings>(res);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}
