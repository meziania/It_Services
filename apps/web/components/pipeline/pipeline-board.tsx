"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { Offer, OfferStatus } from "@/lib/types";
import { STATUS_ORDER, STATUS_META, PlatformBadge, ScoreBadge } from "@/components/ui/domain-badges";
import { updateOfferStatus } from "@/lib/api";

const COLUMN_DOT: Record<OfferStatus, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-amber-500",
  REPLIED: "bg-violet-500",
  WON: "bg-emerald-500",
  LOST: "bg-red-500",
  SKIP: "bg-slate-500",
};

export function PipelineBoard({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const columns = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_META[status].label,
    offers: offers.filter((o) => o.status === status),
  }));

  async function moveOffer(id: string, status: OfferStatus) {
    setPendingId(id);
    await updateOfferStatus(id, status);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {columns.map((col) => (
        <div key={col.status} className="min-w-[220px] rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <span className={`h-2 w-2 rounded-full ${COLUMN_DOT[col.status]}`} />
              {col.label}
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {col.offers.length}
            </span>
          </div>

          <div className="flex max-h-[calc(100vh-260px)] flex-col gap-2 overflow-y-auto p-3">
            {col.offers.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-slate-600">Vide</p>
            ) : (
              col.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 transition-colors hover:border-slate-700"
                >
                  <Link
                    href={`/opportunities/${offer.id}`}
                    className="line-clamp-2 text-sm font-medium text-slate-200 hover:text-teal-400 hover:underline"
                  >
                    {offer.title}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <PlatformBadge platform={offer.platform} />
                    <ScoreBadge score={offer.matchScore} />
                  </div>
                  <select
                    disabled={pendingId === offer.id}
                    value={offer.status}
                    onChange={(e) => moveOffer(offer.id, e.target.value as OfferStatus)}
                    className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-400 disabled:opacity-50"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
