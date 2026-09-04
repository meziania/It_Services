"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Offer } from "@/lib/types";

const HIGH_SCORE = Number(process.env.NEXT_PUBLIC_HIGH_SCORE_THRESHOLD ?? 70);

/**
 * Bell showing NEW offers with matchScore ≥ threshold (default 70).
 * Uses same-origin /api proxy pattern via server-rendered cookie session
 * through a lightweight client fetch to Nest via Next... actually offers
 * are loaded server-side elsewhere; here we hit a Next route isn't needed —
 * we call /api/... no offers list proxy for GET.
 *
 * Uses browser → Next server component already has cookies; for client we
 * need an API route. Simpler: fetch from a new /api/alerts/high-score route.
 */
export function HighScoreAlertsBell() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/alerts/high-score`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Offer[];
      setOffers(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const count = offers.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700"
        title={`Alertes score ≥ ${HIGH_SCORE}`}
      >
        <Bell size={12} className={count > 0 ? "text-amber-400" : "text-slate-500"} />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
        Alertes
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-xl">
          <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Nouvelles · score ≥ {HIGH_SCORE}
          </p>
          {count === 0 ? (
            <p className="px-2 py-3 text-xs text-slate-500">Aucune alerte pour le moment.</p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {offers.slice(0, 8).map((offer) => (
                <li key={offer.id}>
                  <Link
                    href={`/opportunities/${offer.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 hover:bg-slate-900"
                  >
                    <span className="line-clamp-2 text-xs font-medium text-slate-200">{offer.title}</span>
                    <span className="mt-0.5 block text-[11px] text-teal-400">
                      Score {offer.matchScore} · {offer.platform}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/opportunities`}
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-2 py-2 text-center text-[11px] font-medium text-teal-400 hover:bg-slate-900"
          >
            Voir toutes les opportunités
          </Link>
        </div>
      ) : null}
    </div>
  );
}
