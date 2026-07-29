import "server-only";
import { cookies } from "next/headers";
import type {
  CurrentUser,
  HealthResponse,
  Offer,
  OfferStatus,
  PlatformSourceDto,
  TeamMember,
  TeamSettings,
} from "./types";
import { API_URL } from "./api";
import { SESSION_COOKIE } from "./session-cookie";

async function authHeaders(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return Boolean(store.get(SESSION_COOKIE)?.value);
}

export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return safeJson<HealthResponse>(res);
  } catch {
    return null;
  }
}

export async function getOffers(status?: OfferStatus): Promise<Offer[]> {
  try {
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`${API_URL}/offers${qs}`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    return (await safeJson<Offer[]>(res)) ?? [];
  } catch {
    return [];
  }
}

export async function getOffer(id: string): Promise<Offer | null> {
  try {
    const res = await fetch(`${API_URL}/offers/${id}`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    return safeJson<Offer>(res);
  } catch {
    return null;
  }
}

export async function getSources(): Promise<PlatformSourceDto[]> {
  try {
    const res = await fetch(`${API_URL}/sources`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    return (await safeJson<PlatformSourceDto[]>(res)) ?? [];
  } catch {
    return [];
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { cache: "no-store", headers: await authHeaders() });
    return safeJson<CurrentUser>(res);
  } catch {
    return null;
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${API_URL}/auth/users`, { cache: "no-store", headers: await authHeaders() });
    return (await safeJson<TeamMember[]>(res)) ?? [];
  } catch {
    return [];
  }
}

export async function getSettings(): Promise<TeamSettings | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store", headers: await authHeaders() });
    return safeJson<TeamSettings>(res);
  } catch {
    return null;
  }
}

export { authHeaders };
