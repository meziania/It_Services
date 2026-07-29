"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { createSource } from "@/lib/api";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = [
  "REKRUTE",
  "MARCHES_PUBLICS",
  "JOBMAROC",
  "INDEED",
  "LINKEDIN",
  "FIVERR",
  "AMAZON",
  "OTHER",
];

export function AddSourceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("REKRUTE");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [frequencyMinutes, setFrequencyMinutes] = useState(1440);
  const [maxPages, setMaxPages] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await createSource({
      platform,
      name,
      baseUrl: baseUrl || undefined,
      frequencyMinutes,
      maxPages,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    });

    setPending(false);
    if (!result.ok) {
      setError(result.message ?? "Impossible de créer cette source.");
      return;
    }

    setName("");
    setBaseUrl("");
    setKeywords("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500"
        >
          <Plus size={14} /> Nouvelle source
        </button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader title="Nouvelle source" subtitle="Enregistrer une plateforme à scanner" />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Plateforme</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nom</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: ReKrute — Dev Web"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">URL de base (optionnel)</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Mots-clés (séparés par des virgules)</label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="développeur, react, laravel"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Fréquence (minutes)</label>
          <input
            type="number"
            min={5}
            value={frequencyMinutes}
            onChange={(e) => setFrequencyMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Pages max par run</label>
          <input
            type="number"
            min={1}
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {error ? <p className="sm:col-span-2 xl:col-span-3 text-xs text-red-400">{error}</p> : null}

        <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Créer
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </Card>
  );
}
