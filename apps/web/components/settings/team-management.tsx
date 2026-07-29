"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, ShieldCheck, User as UserIcon } from "lucide-react";
import type { Role, TeamMember } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { createTeamMember } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function TeamManagement({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    const result = await createTeamMember(email, password, role);
    setPending(false);
    if (!result.ok) {
      setError(result.message ?? "Impossible d'ajouter ce membre.");
      return;
    }
    setSuccess(true);
    setEmail("");
    setPassword("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader
        title="Équipe"
        subtitle="Inviter des membres (authentification par email / mot de passe)"
      />
      <div className="space-y-4 p-5">
        <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between bg-slate-950/60 px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {member.role === "ADMIN" ? (
                  <ShieldCheck size={14} className="text-teal-400" />
                ) : (
                  <UserIcon size={14} className="text-slate-500" />
                )}
                {member.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    member.role === "ADMIN"
                      ? "bg-teal-500/10 text-teal-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {member.role}
                </span>
                <span>{formatDate(member.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 border-t border-slate-800 pt-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collegue@exemple.com"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">Mot de passe temporaire</label>
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères min."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-teal-500 focus:outline-none"
            >
              <option value="MEMBER">Membre</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Ajouter
          </button>
        </form>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        {success ? <p className="text-xs text-emerald-400">Membre ajouté avec succès.</p> : null}
      </div>
    </Card>
  );
}
