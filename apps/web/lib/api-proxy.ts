import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "./api";
import { SESSION_COOKIE } from "./session-cookie";

/**
 * Forwards a client-invoked mutation to the NestJS API with the session
 * cookie as a Bearer token — shared by every app/api/... route handler so
 * new proxies (sources, settings, users, ...) don't repeat the same
 * boilerplate. See lib/api-server.ts for the read-side equivalent.
 */
export async function proxyToApi(
  request: NextRequest,
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<NextResponse> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const hasBody = method !== "DELETE";
  const body = hasBody ? await request.text() : undefined;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body } : {}),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
