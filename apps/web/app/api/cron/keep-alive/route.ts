import { NextResponse } from "next/server";

/**
 * Optional daily keep-alive (Vercel Cron). Primary anti-sleep is the GitHub
 * Action every 10 minutes — Hobby Vercel crons are limited to once per day.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!apiUrl) {
    return NextResponse.json({ ok: false, message: "NEXT_PUBLIC_API_URL missing" }, { status: 500 });
  }

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    const body = await res.json().catch(() => null);
    return NextResponse.json({ ok: res.ok, status: res.status, body });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
