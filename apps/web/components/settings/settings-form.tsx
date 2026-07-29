"use client";

import { useState } from "react";
import { Plus, X, Save, RotateCcw, Check, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { updateSettings } from "@/lib/api";
import type { MessageTemplate, ScoringWeights, ServiceEntry, TeamSettings } from "@/lib/types";

const DEFAULT_WEIGHTS: ScoringWeights = {
  stack: 40,
  freelance: 25,
  freshness: 15,
  location: 10,
  budget: 10,
};

const WEIGHT_LABELS: Record<keyof ScoringWeights, string> = {
  stack: "Stack / Compétences",
  freelance: "Type d'offre freelance",
  freshness: "Fraîcheur de l'offre",
  location: "Localisation",
  budget: "Budget / Rémunération",
};

interface SettingsFormState {
  skills: string[];
  services: ServiceEntry[];
  weights: ScoringWeights;
  template: MessageTemplate;
}

export function SettingsForm({ initialSettings }: { initialSettings: TeamSettings | null }) {
  const [state, setState] = useState<SettingsFormState>({
    skills: initialSettings?.skills ?? [],
    services: initialSettings?.services ?? [],
    weights: initialSettings?.weights ?? DEFAULT_WEIGHTS,
    template: initialSettings?.template ?? { subject: "", body: "" },
  });
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: SettingsFormState) {
    setState(next);
    setSaving(true);
    setError(null);
    const result = await updateSettings(next);
    setSaving(false);
    if (!result.ok) {
      setError(result.message ?? "Échec de l'enregistrement.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function addSkill() {
    if (!newSkill.trim()) return;
    persist({ ...state, skills: [...state.skills, newSkill.trim()] });
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    persist({ ...state, skills: state.skills.filter((s) => s !== skill) });
  }

  function toggleService(code: string) {
    persist({
      ...state,
      services: state.services.map((s) => (s.code === code ? { ...s, enabled: !s.enabled } : s)),
    });
  }

  function updateWeight(key: keyof ScoringWeights, value: number) {
    setState((s) => ({ ...s, weights: { ...s.weights, [key]: value } }));
  }

  const weightTotal = Object.values(state.weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Compétences / Stack" subtitle="Utilisées pour le score de correspondance" />
          <div className="p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {state.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Ajouter une compétence…"
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
              />
              <button
                onClick={addSkill}
                className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Services proposés" subtitle="Mappés depuis le catalogue Docs2/14" />
          <div className="space-y-2 p-5">
            {state.services.map((service) => (
              <label
                key={service.code}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <span className="text-sm text-slate-300">{service.label}</span>
                <input
                  type="checkbox"
                  checked={service.enabled}
                  onChange={() => toggleService(service.code)}
                  className="h-4 w-4 accent-teal-500"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Pondération du scoring"
            subtitle={weightTotal === 100 ? "Total 100%" : `Total ${weightTotal}% (idéal: 100%)`}
          />
          <div className="space-y-4 p-5">
            {(Object.keys(state.weights) as (keyof ScoringWeights)[]).map((key) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{WEIGHT_LABELS[key]}</span>
                  <span>{state.weights[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={state.weights[key]}
                  onChange={(e) => updateWeight(key, Number(e.target.value))}
                  onMouseUp={() => persist(state)}
                  onTouchEnd={() => persist(state)}
                  className="w-full accent-teal-500"
                />
              </div>
            ))}
            <button
              onClick={() => persist({ ...state, weights: DEFAULT_WEIGHTS })}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              <RotateCcw size={12} /> Réinitialiser les pondérations
            </button>
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader
            title="Template de message par défaut"
            subtitle="Variables : {titre}, {entreprise}, {plateforme}, {votre_nom}, {portfolio}"
            action={
              <button
                onClick={() => persist(state)}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : saved ? (
                  <Check size={13} />
                ) : (
                  <Save size={13} />
                )}
                {saved ? "Enregistré !" : "Enregistrer le template"}
              </button>
            }
          />
          <div className="space-y-3 p-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Objet</label>
              <input
                value={state.template.subject}
                onChange={(e) => setState((s) => ({ ...s, template: { ...s.template, subject: e.target.value } }))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Corps du message</label>
              <textarea
                value={state.template.body}
                onChange={(e) => setState((s) => ({ ...s, template: { ...s.template, body: e.target.value } }))}
                rows={8}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
