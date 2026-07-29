"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, Pencil, Trash2, X, Save } from "lucide-react";
import type { PlatformSourceDto } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/domain-badges";
import { timeAgo, nextRunLabel } from "@/lib/format";
import { runSource, updateSource, deleteSource } from "@/lib/api";

interface RowProps {
  source: PlatformSourceDto;
  isEditing: boolean;
  isRunning: boolean;
  isBusy: boolean;
  error?: string;
  onToggleEdit: () => void;
  onRun: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSave: (patch: { keywords: string[]; frequencyMinutes: number; maxPages: number }) => void;
}

function SourceRow({
  source,
  isEditing,
  isRunning,
  isBusy,
  error,
  onToggleEdit,
  onRun,
  onToggleActive,
  onDelete,
  onSave,
}: RowProps) {
  const [keywords, setKeywords] = useState(source.keywords.join(", "));
  const [frequencyMinutes, setFrequencyMinutes] = useState(source.frequencyMinutes);
  const [maxPages, setMaxPages] = useState(source.maxPages);

  return (
    <>
      <tr className="hover:bg-slate-900/60">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={source.platform} />
            <span className="text-slate-300">{source.name}</span>
          </div>
          {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggleActive}
            disabled={isBusy}
            className={`inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 ${
              source.active ? "text-emerald-400" : "text-slate-500"
            }`}
            title={source.active ? "Cliquer pour désactiver" : "Cliquer pour activer"}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${source.active ? "bg-emerald-500" : "bg-slate-600"}`} />
            {source.lastRunStatus ?? (source.active ? "Actif" : "Désactivé")}
          </button>
        </td>
        <td className="px-4 py-3 text-slate-400">{timeAgo(source.lastRunAt)}</td>
        <td className="px-4 py-3 text-slate-400">
          {source.frequencyMinutes >= 1440
            ? `${Math.round(source.frequencyMinutes / 1440)}j`
            : `${source.frequencyMinutes}min`}
        </td>
        <td className="px-4 py-3 text-slate-400">
          {source.active ? nextRunLabel(source.lastRunAt, source.frequencyMinutes) : "—"}
        </td>
        <td className="px-4 py-3 text-slate-400">{source.offerCount ?? 0}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <button
              disabled={isRunning}
              onClick={onRun}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-teal-600 hover:text-teal-400 disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Lancer
            </button>
            <button
              onClick={onToggleEdit}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-teal-600 hover:text-teal-400"
              title="Modifier"
            >
              {isEditing ? <X size={13} /> : <Pencil size={13} />}
            </button>
            <button
              onClick={onDelete}
              disabled={isBusy}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-red-600 hover:text-red-400 disabled:opacity-50"
              title="Supprimer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {isEditing ? (
        <tr className="bg-slate-950/60">
          <td colSpan={7} className="px-5 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Fréquence (min)</label>
                <input
                  type="number"
                  min={5}
                  value={frequencyMinutes}
                  onChange={(e) => setFrequencyMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Pages max</label>
                <input
                  type="number"
                  min={1}
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() =>
                onSave({
                  keywords: keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                  frequencyMinutes,
                  maxPages,
                })
              }
              disabled={isBusy}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500 disabled:opacity-60"
            >
              {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Enregistrer
            </button>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function SourcesTable({ sources }: { sources: PlatformSourceDto[] }) {
  const router = useRouter();
  const [runningId, setRunningId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const active = sources.filter((s) => s.active);
  const inactive = sources.filter((s) => !s.active);

  async function handleRun(id: string) {
    setRunningId(id);
    setErrors((e) => ({ ...e, [id]: "" }));
    const result = await runSource(id);
    if (!result.ok) {
      setErrors((e) => ({ ...e, [id]: result.message ?? "Erreur inconnue" }));
    }
    setRunningId(null);
    router.refresh();
  }

  async function handleToggleActive(source: PlatformSourceDto) {
    setBusyId(source.id);
    await updateSource(source.id, { active: !source.active });
    setBusyId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Supprimer la source "${name}" ? Cette action est définitive.`)) return;
    setBusyId(id);
    const result = await deleteSource(id);
    setBusyId(null);
    if (!result.ok) {
      setErrors((e) => ({ ...e, [id]: result.message ?? "Suppression impossible" }));
      return;
    }
    router.refresh();
  }

  async function handleSaveEdit(
    id: string,
    patch: { keywords: string[]; frequencyMinutes: number; maxPages: number },
  ) {
    setBusyId(id);
    const result = await updateSource(id, patch);
    setBusyId(null);
    if (!result.ok) {
      setErrors((e) => ({ ...e, [id]: result.message ?? "Échec de la mise à jour" }));
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  function Table({ rows }: { rows: PlatformSourceDto[] }) {
    return (
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Dernière exécution</th>
            <th className="px-4 py-3 font-medium">Fréquence</th>
            <th className="px-4 py-3 font-medium">Prochain run</th>
            <th className="px-4 py-3 font-medium">Offres</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              isEditing={editingId === source.id}
              isRunning={runningId === source.id}
              isBusy={busyId === source.id}
              error={errors[source.id]}
              onToggleEdit={() => setEditingId(editingId === source.id ? null : source.id)}
              onRun={() => handleRun(source.id)}
              onToggleActive={() => handleToggleActive(source)}
              onDelete={() => handleDelete(source.id, source.name)}
              onSave={(patch) => handleSaveEdit(source.id, patch)}
            />
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-x-auto">
        <Table rows={active} />
        {active.length === 0 ? (
          <p className="p-5 text-center text-sm text-slate-500">Aucune source active pour le moment.</p>
        ) : null}
      </Card>

      {inactive.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Sources désactivées</p>
          <Card className="overflow-x-auto opacity-70">
            <Table rows={inactive} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
