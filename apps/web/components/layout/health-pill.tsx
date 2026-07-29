"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getHealth } from "@/lib/api";

export function HealthPill() {
  const [status, setStatus] = useState<"ok" | "degraded" | "unknown">("unknown");
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    const health = await getHealth();
    setStatus(health?.dependencies.database === "up" ? "ok" : "degraded");
    setChecking(false);
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const dotColor =
    status === "ok" ? "bg-emerald-500" : status === "degraded" ? "bg-red-500" : "bg-slate-500";
  const label = status === "ok" ? "Santé système 100%" : status === "degraded" ? "Système dégradé" : "Vérification…";

  return (
    <button
      onClick={check}
      className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700"
      title="Rafraîchir le statut"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
      <RefreshCw size={12} className={checking ? "animate-spin" : ""} />
    </button>
  );
}
