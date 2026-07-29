"use client";

import { useActionState } from "react";
import { Mail, Lock, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { registerAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 35%, rgba(13,148,136,0.12), transparent 70%)",
        }}
      />
      <Sparkles className="absolute bottom-10 right-10 h-6 w-6 text-slate-700" />

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <Logo size={56} />
          <h1 className="mt-5 text-xl font-bold text-white">
            Créer le compte administrateur
            <br />
            ServiceIt-scanner
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Réservé au tout premier compte — les suivants sont créés par un admin.
          </p>
        </div>

        <form action={formAction} className="mt-7 space-y-3.5">
          {state.error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              {state.error}
            </div>
          ) : null}

          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              name="email"
              required
              placeholder="Adresse Email"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Mot de passe (8 caractères min.)"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirmer le mot de passe"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : null}
            Créer le compte
          </button>

          <p className="text-center text-xs text-slate-500">
            Déjà un compte ?{" "}
            <a href="/login" className="font-medium text-teal-400 hover:text-teal-300 hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
