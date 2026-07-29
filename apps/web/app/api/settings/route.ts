import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/api-proxy";

export async function PUT(request: NextRequest) {
  return proxyToApi(request, "/settings", "PUT");
}
