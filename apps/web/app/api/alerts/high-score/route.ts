import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const HIGH_SCORE = Number(process.env.NEXT_PUBLIC_HIGH_SCORE_THRESHOLD ?? 70);

/** NEW offers at/above high-score threshold — powers the header alerts bell. */
export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const qs = new URLSearchParams({
      status: "NEW",
      minScore: String(Number.isFinite(HIGH_SCORE) ? HIGH_SCORE : 70),
    });
    const res = await fetch(`${API_URL}/offers?${qs}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
