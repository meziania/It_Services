"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Phone,
} from "lucide-react";
import type { Offer, OfferStatus } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { PlatformBadge, CategoryBadge, StatusBadge, OfferTypeBadge } from "@/components/ui/domain-badges";
import { formatDate } from "@/lib/format";
import { buildDraftMessage, buildMailtoUrl, buildWhatsAppUrl } from "@/lib/message-template";
import { updateOfferStatus } from "@/lib/api";

const STATUS_FLOW: OfferStatus[] = ["NEW", "CONTACTED", "REPLIED", "WON", "LOST", "SKIP"];

export function OfferDetail({ offer: initialOffer }: { offer: Offer }) {
  const router = useRouter();
  const [offer, setOffer] = useState(initialOffer);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");

  const draft = useMemo(() => buildDraftMessage(offer), [offer]);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);

  const emailContact = offer.contacts?.find((c) => c.type === "EMAIL");
  const phoneContact = offer.contacts?.find((c) => c.type === "WHATSAPP" || c.type === "PHONE");

  async function changeStatus(status: OfferStatus) {
    setSaving(true);
    const updated = await updateOfferStatus(offer.id, status);
    if (updated) setOffer(updated);
    setSaving(false);
    router.refresh();
  }

  function copyMessage() {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/opportunities")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft size={15} />
        Retour à la liste
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{offer.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <PlatformBadge platform={offer.platform} />
            <CategoryBadge category={offer.itCategory} />
            <OfferTypeBadge offerType={offer.offerType} />
            {offer.companyName ? <span>· {offer.companyName}</span> : null}
            {offer.location ? <span>· {offer.location}</span> : null}
            <a
              href={offer.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-teal-400 hover:underline"
            >
              Voir l&apos;annonce <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Description de l'offre" />
            <p className="whitespace-pre-line px-5 py-4 text-sm leading-relaxed text-slate-300">
              {offer.descriptionClean ?? offer.descriptionRaw}
            </p>
          </Card>

          <Card>
            <CardHeader title="Contacts détectés" subtitle={`${offer.contacts?.length ?? 0} trouvé(s)`} />
            <div className="space-y-2 p-5">
              {(offer.contacts ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aucun contact public dans l&apos;annonce — postulez via{" "}
                  <a href={offer.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                    la plateforme
                  </a>
                  .
                </p>
              ) : (
                offer.contacts?.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      {contact.type === "EMAIL" ? <Mail size={14} /> : <Phone size={14} />}
                      {contact.value}
                    </div>
                    <span className="text-xs text-slate-500">
                      {contact.confidence >= 70 ? "Vérifié" : `Confiance ${contact.confidence}%`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Message de prospection" subtitle="Brouillon — relisez avant d'envoyer" />
            <div className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Objet</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Corps du message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={emailContact ? buildMailtoUrl(emailContact.value, subject, body) : "#"}
                  onClick={(e) => {
                    if (!emailContact) e.preventDefault();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    emailContact
                      ? "bg-teal-600 text-white hover:bg-teal-500"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                  }`}
                >
                  <Mail size={15} /> Envoyer par Email
                </a>
                <a
                  href={phoneContact ? buildWhatsAppUrl(phoneContact.value, body) : "#"}
                  onClick={(e) => {
                    if (!phoneContact) e.preventDefault();
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    phoneContact
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                  }`}
                >
                  <MessageCircle size={15} /> Ouvrir WhatsApp
                </a>
                <button
                  onClick={copyMessage}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-600"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copied ? "Copié !" : "Copier le message"}
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Actions rapides" />
            <div className="flex flex-wrap gap-2 p-5">
              <button
                disabled={saving}
                onClick={() => changeStatus("CONTACTED")}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-emerald-600 hover:text-emerald-400 disabled:opacity-50"
              >
                <CheckCircle2 size={15} /> Marquer comme contacté
              </button>
              <button
                disabled={saving}
                onClick={() => changeStatus("SKIP")}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-red-600 hover:text-red-400 disabled:opacity-50"
              >
                <XCircle size={15} /> Ignorer cette offre
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Notes internes" />
            <div className="p-5">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notes privées sur ce lead…"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-200">Score &amp; pourquoi</h2>
            <div className="mt-4 flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-800">
                <span
                  className={`text-3xl font-bold ${
                    offer.matchScore >= 70
                      ? "text-emerald-400"
                      : offer.matchScore >= 40
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {offer.matchScore}
                </span>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {offer.matchReasons.length === 0 ? (
                <li className="text-slate-500">Aucune explication disponible.</li>
              ) : (
                offer.matchReasons.map((reason, i) => (
                  <li key={i} className="rounded-lg bg-slate-950/60 px-3 py-2 text-slate-300">
                    {reason}
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-200">Changer le statut</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  disabled={saving}
                  onClick={() => changeStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                    offer.status === s
                      ? "bg-teal-600 text-white"
                      : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 text-sm text-slate-400">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">Historique</h2>
            <ul className="space-y-2">
              <li>Publiée : {formatDate(offer.publishedAt)}</li>
              <li>Ajoutée au scanner : {formatDate(offer.createdAt)}</li>
              <li>Dernière mise à jour : {formatDate(offer.updatedAt)}</li>
              {offer.deadline ? <li>Deadline : {formatDate(offer.deadline)}</li> : null}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
