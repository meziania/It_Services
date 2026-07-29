import type { ReactNode } from "react";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import { Sidebar } from "./sidebar";
import { HealthPill } from "./health-pill";
import { getCurrentUser } from "@/lib/api-server";

export async function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            {currentUser ? (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300">
                {currentUser.role === "ADMIN" ? (
                  <ShieldCheck size={12} className="text-teal-400" />
                ) : (
                  <UserIcon size={12} className="text-slate-500" />
                )}
                {currentUser.email}
              </span>
            ) : null}
            <HealthPill />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
