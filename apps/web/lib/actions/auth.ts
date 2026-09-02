"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export interface AuthActionState {
  error?: string;
}

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: "Impossible de joindre l'API. Est-elle démarrée ?" };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.message ?? "Email ou mot de passe invalide." };
  }

  const data = (await res.json()) as { accessToken: string };
  const store = await cookies();
  store.set(SESSION_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });

  redirect("/");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
