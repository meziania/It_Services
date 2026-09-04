import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** Same-origin health proxy — avoids browser CORS failures that show “Système dégradé”. */
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { status: "error" }, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "error", dependencies: { database: "down" } },
      { status: 503 },
    );
  }
}
