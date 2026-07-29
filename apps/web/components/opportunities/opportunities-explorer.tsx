"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, RotateCcw } from "lucide-react";
import type { Offer, OfferStatus } from "@/lib/types";
import {
  PlatformBadge,
  CategoryBadge,
  StatusBadge,
  OfferTypeBadge,
  ScoreBadge,
  ContactIndicator,
} from "@/components/ui/domain-badges";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

const STATUS_OPTIONS: { value: OfferStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "NEW", label: "Nouveau" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "REPLIED", label: "Répondu" },
  { value: "WON", label: "Gagné" },
  { value: "LOST", label: "Perdu" },
  { value: "SKIP", label: "Ignoré" },
];

const selectClasses =
  "rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 focus:border-teal-500 focus:outline-none";

export function OpportunitiesExplorer({ offers }: { offers: Offer[] }) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState<OfferStatus | "ALL">("ALL");
  const [remote, setRemote] = useState("ALL");
  const [minScore, setMinScore] = useState(0);
  const [contactOnly, setContactOnly] = useState(false);

  const platforms = useMemo(() => Array.from(new Set(offers.map((o) => o.platform))), [offers]);
  const categories = useMemo(() => Array.from(new Set(offers.map((o) => o.itCategory))), [offers]);

  const filtered = offers.filter((o) => {
    if (search && !`${o.title} ${o.companyName ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (platform !== "ALL" && o.platform !== platform) return false;
    if (category !== "ALL" && o.itCategory !== category) return false;
    if (status !== "ALL" && o.status !== status) return false;
    if (remote === "REMOTE" && !o.remote) return false;
    if (remote === "ONSITE" && o.remote) return false;
    if (o.matchScore < minScore) return false;
    if (contactOnly && (o.contacts?.length ?? 0) === 0) return false;
    return true;
  });

  function reset() {
    setSearch("");
    setPlatform("ALL");
    setCategory("ALL");
    setStatus("ALL");
    setRemote("ALL");
    setMinScore(0);
    setContactOnly(false);
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une offre, une entreprise…"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClasses}>
          <option value="ALL">Toutes plateformes</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClasses}>
          <option value="ALL">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OfferStatus | "ALL")}
          className={selectClasses}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select value={remote} onChange={(e) => setRemote(e.target.value)} className={selectClasses}>
          <option value="ALL">Remote / On-site</option>
          <option value="REMOTE">Remote</option>
          <option value="ONSITE">On-site</option>
        </select>

        <label className="flex items-center gap-2 text-xs text-slate-400">
          Score min {minScore}
          <input
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="accent-teal-500"
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={contactOnly}
            onChange={(e) => setContactOnly(e.target.checked)}
            className="h-3.5 w-3.5 accent-teal-500"
          />
          Avec contact uniquement
        </label>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:border-slate-700 hover:text-slate-200"
        >
          <RotateCcw size={13} />
          Réinitialiser
        </button>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Titre de l&apos;offre</th>
              <th className="px-4 py-3 font-medium">Entreprise</th>
              <th className="px-4 py-3 font-medium">Plateforme</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Lieu</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((offer) => (
              <tr key={offer.id} className="hover:bg-slate-900/60">
                <td className="max-w-xs truncate px-5 py-3">
                  <Link
                    href={`/opportunities/${offer.id}`}
                    className="font-medium text-slate-200 hover:text-teal-400 hover:underline"
                  >
                    {offer.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{offer.companyName ?? "-"}</td>
                <td className="px-4 py-3">
                  <PlatformBadge platform={offer.platform} />
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={offer.itCategory} />
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={offer.matchScore} />
                </td>
                <td className="px-4 py-3">
                  <ContactIndicator contacts={offer.contacts} />
                </td>
                <td className="px-4 py-3">
                  <OfferTypeBadge offerType={offer.offerType} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={offer.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{offer.location ?? (offer.remote ? "Remote" : "-")}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(offer.publishedAt ?? offer.createdAt)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                  Aucune offre ne correspond à ces filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-slate-600">
        {filtered.length} offre{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur{" "}
        {offers.length}
      </p>
    </div>
  );
}
